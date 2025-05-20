import { Inject, Injectable } from '@nestjs/common';
import { CreateRewardClaimDto } from './dto/create-reward-claim.dto';
import { RewardClaim } from './schema/reward-claim .schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import {
  GetRewardClaimsByUserDto,
  GetRewardClaimsDto,
} from './dto/get-reward-claims-dto';
import { AUTH_SERVICE, EventType, RewardClaimStatus } from '@app/common';
import { lastValueFrom } from 'rxjs';
import { ManuallyProcessingDto } from './dto/manually-processing.dto';
import { EventProcessService } from '../event-process/event-process.service';
import { EventAttendanceService } from '../event-attendance/event-attendance.service';

@Injectable()
export class RewardClaimService {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authMicroservice: ClientProxy,
    private readonly eventProcessService: EventProcessService,
    private readonly eventAttendanceService: EventAttendanceService,
    @InjectModel(RewardClaim.name)
    private readonly rewardClaimModel: Model<RewardClaim>,
  ) {}

  private async findOneByUserIdAndEventId(userId: string, eventId: string) {
    const rewardClaim = await this.rewardClaimModel.find({
      userId,
      event: eventId,
    });
    return rewardClaim;
  }

  private async getUserByEmail(email: string) {
    // Auth Service에 유저 조회 요청
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.authMicroservice.send({ cmd: 'get-user-by-email' }, email),
      );

      if (!response || response === '') {
        throw new RpcException('유저 정보 조회 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private async findOneById(id: string) {
    const rewardClaim = await this.rewardClaimModel.findById(id);
    if (!rewardClaim) {
      throw new RpcException('존재하지 않는 보상 요청 입니다.');
    }

    return rewardClaim;
  }

  // 공통 필터 생성 함수
  private async buildRewardClaimFilter(params: {
    userId?: string;
    userEmail?: string;
    status?: string;
    eventName?: string;
  }): Promise<any> {
    const { userId, userEmail, status, eventName } = params;
    const filter: any = {};

    if (userId) {
      filter.userId = userId;
    } else if (userEmail) {
      const user = await this.getUserByEmail(userEmail);
      filter.userId = user
        ? user._id
        : new Types.ObjectId('000000000000000000000000'); // 존재하지 않으면 무조건 검색 안 되게
    }

    if (status) {
      filter.status = status;
    }

    if (eventName) {
      const events = await this.eventProcessService.findByName(eventName);
      filter.event =
        events && events.length > 0
          ? { $in: events.map((r) => r._id) }
          : { $in: [new Types.ObjectId('000000000000000000000000')] };
    }

    return filter;
  }

  async create(createRewardClaimDto: CreateRewardClaimDto) {
    const { userId, event: eventId } = createRewardClaimDto;
    const event = await this.eventProcessService.findOneById(eventId);

    if (!event) {
      throw new RpcException('잘못된 보상 요청 입니다.');
    }

    if (!event.rewards || (event.rewards && event.rewards.length <= 0)) {
      throw new RpcException('보상 정보가 없는 이벤트 입니다.');
    }

    const rewardClaims = await this.findOneByUserIdAndEventId(userId, eventId);
    // 해당 이벤트에 보상 이력이 있는지 체크
    const isSuccess =
      rewardClaims &&
      rewardClaims.some(
        (rewardClaim) => rewardClaim.status === RewardClaimStatus.SUCCESS,
      );
    if (isSuccess) {
      throw new RpcException('이미 보상 완료된 이벤트 입니다.');
    } else if (
      // 해당 이벤트에 이미 진행중인 요청한 보상 내역이 있는지 체크
      rewardClaims &&
      rewardClaims.length === 1 &&
      rewardClaims[0].status === RewardClaimStatus.PENDING
    ) {
      throw new RpcException('현재 이벤트 보상 검토중 입니다.');
    }

    // 출석체크 이벤트인 경우 자동 검증
    if (event.eventType === EventType.ATTENDANCE) {
      const requiredDays = parseInt(event.condition);
      if (isNaN(requiredDays) || requiredDays <= 0) {
        throw new RpcException(
          `이벤트 조건 파싱 오류, event.condition: ${event.condition}`,
        );
      }
      const verifyConsecutiveAttendance =
        await this.eventAttendanceService.verifyConsecutiveAttendanceFromDate(
          userId,
          event.startAt,
          requiredDays,
        );

      if (verifyConsecutiveAttendance.success) {
        createRewardClaimDto.status = RewardClaimStatus.SUCCESS;
        createRewardClaimDto.operatorBy = 'SYSTEM';
      } else {
        createRewardClaimDto.status = RewardClaimStatus.FAILURE;
        createRewardClaimDto.failReason = verifyConsecutiveAttendance.message;
        createRewardClaimDto.operatorBy = 'SYSTEM';
      }
    }

    const created = await this.rewardClaimModel.create(createRewardClaimDto);
    return await created.save();
  }

  async findAllByUser(getRewardClaimsByUserDto: GetRewardClaimsByUserDto) {
    const {
      page = 1,
      take = 25,
      userId,
      status,
      eventName,
    } = getRewardClaimsByUserDto;
    const skip = (page - 1) * take;

    const filter = await this.buildRewardClaimFilter({
      userId,
      status,
      eventName,
    });

    const [data, total] = await Promise.all([
      this.rewardClaimModel
        .find(filter)
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .exec(),
      this.rewardClaimModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findAll(getRewardClaimsDto: GetRewardClaimsDto) {
    const {
      page = 1,
      take = 25,
      userEmail,
      status,
      eventName,
    } = getRewardClaimsDto;
    const skip = (page - 1) * take;

    const filter = await this.buildRewardClaimFilter({
      userEmail,
      status,
      eventName,
    });

    const [data, total] = await Promise.all([
      this.rewardClaimModel
        .find(filter)
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .exec(),
      this.rewardClaimModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * 요청된 보상 수동 처리
   * @param manuallyProcessingDto 보상 요청 처리 정보
   * @returns 결과
   */
  async rewardClaimProcessing(manuallyProcessingDto: ManuallyProcessingDto) {
    const { rewardClaimId } = manuallyProcessingDto;
    const rewardClaim = await this.findOneById(rewardClaimId);

    if (rewardClaim.status === RewardClaimStatus.SUCCESS) {
      throw new RpcException(
        `해당 이벤트 보상 요구는 이미 보상 완료된 상태 입니다.`,
      );
    }

    await this.rewardClaimModel
      .findByIdAndUpdate(rewardClaim._id, manuallyProcessingDto)
      .exec();

    return this.rewardClaimModel.findById(rewardClaim._id);
  }
}
