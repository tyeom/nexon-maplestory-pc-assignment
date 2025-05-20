import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { EVENT_SERVICE } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserDto } from '../user/dto/user.dto';
import { lastValueFrom } from 'rxjs';
import {
  GetRewardClaimsByUserDto,
  GetRewardClaimsDto,
} from './dto/get-reward-claims-dto';
import { ManuallyProcessingDto } from './dto/manually-processing.dto';

@Injectable()
export class RewardClaimService {
  constructor(
    @Inject(EVENT_SERVICE)
    private readonly eventMicroservice: ClientProxy,
  ) {}

  async create(eventId: string, user: UserDto) {
    // eslint-disable-next-line no-useless-catch
    try {
      const payload = { event: eventId, userId: user._id };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.eventMicroservice.send({ cmd: 'reward-claim-create' }, payload),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('보상 요청 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }

  async findAllByUser(dto: GetRewardClaimsByUserDto, user: UserDto) {
    // eslint-disable-next-line no-useless-catch
    try {
      const payload = { ...dto, userId: user._id };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.eventMicroservice.send(
          { cmd: 'get-all-reward-claim-user' },
          payload,
        ),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('보상 요청 조회 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }

  async findAll(dto: GetRewardClaimsDto) {
    // eslint-disable-next-line no-useless-catch
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.eventMicroservice.send({ cmd: 'get-all-reward-claim' }, dto),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('보상 요청 조회 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }

  async manuallyProcessing(dto: ManuallyProcessingDto, user: UserDto) {
    // eslint-disable-next-line no-useless-catch
    try {
      const payload = { ...dto, operatorBy: user._id };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.eventMicroservice.send({ cmd: 'manually-processing' }, payload),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('보상 요청 처리 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }
}
