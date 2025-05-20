// reward-claim.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RewardClaimService } from './reward-claim.service';
import { getModelToken } from '@nestjs/mongoose';
import { RewardClaim } from './schema/reward-claim .schema';
import { EventProcessService } from '../event-process/event-process.service';
import { EventAttendanceService } from '../event-attendance/event-attendance.service';
import { RpcException } from '@nestjs/microservices';
import { RewardClaimStatus, EventType, AUTH_SERVICE } from '@app/common';

describe('RewardClaimService', () => {
  let service: RewardClaimService;
  let rewardClaimModel: any;
  let eventProcessService: jest.Mocked<EventProcessService>;
  let eventAttendanceService: jest.Mocked<EventAttendanceService>;

  beforeEach(async () => {
    const mockRewardClaimModel = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
  
    const mockEventProcessService = {
      findOneById: jest.fn(),
    };
  
    const mockEventAttendanceService = {
      verifyConsecutiveAttendanceFromDate: jest.fn(),
    };

    const mockAuthService = {
      send: jest.fn(),
    };
  
    const mockClientProxy = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardClaimService,
        {
          provide: AUTH_SERVICE,
          useValue: mockAuthService,
        },
        {
          provide: getModelToken(RewardClaim.name),
          useValue: mockRewardClaimModel,
        },
        {
          provide: EventProcessService,
          useValue: mockEventProcessService,
        },
        {
          provide: EventAttendanceService,
          useValue: mockEventAttendanceService,
        },
      ],
    }).compile();

    service = module.get<RewardClaimService>(RewardClaimService);
    rewardClaimModel = module.get(getModelToken(RewardClaim.name));
    eventProcessService = module.get(EventProcessService);
    eventAttendanceService = module.get(EventAttendanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('이벤트 보상 요구', () => {
    const createRewardClaimDto = {
      event: 'event-id',
      userId: 'user-id',
      status: RewardClaimStatus.PENDING,
      failReason: null,
      operatorBy: null,
    };

    it('존재하지 않은 이벤트인 경우 RpcException 기대', async () => {
      eventProcessService.findOneById.mockResolvedValue(null as any);

      await expect(service.create(createRewardClaimDto)).rejects.toThrow(
        RpcException,
      );
    });

    it('이미 완료된 보상 청구가 존재 하는 경우 오류 기대', async () => {
      // 존재하는 이벤트
      eventProcessService.findOneById.mockResolvedValue({ _id: 'event-id' } as any);
      // 이미 완료된 이벤트 보상 청구
      jest
        .spyOn<any, any>(service, 'findOneByUserIdAndEventId')
        .mockResolvedValue([{ status: RewardClaimStatus.SUCCESS }]);

      await expect(
        service.create({
          userId: 'user-id',
          event: 'event-id',
        } as any),
      ).rejects.toThrow('이미 보상 완료된 이벤트 입니다.');
    });

    it('검토중인 보상 청구가 존재 하는 경우 오류 기대', async () => {
      // 존재하는 이벤트
      eventProcessService.findOneById.mockResolvedValue({ _id: 'event-id' } as any);
      // 검토중 이벤트 보상 청구
      jest
        .spyOn<any, any>(service, 'findOneByUserIdAndEventId')
        .mockResolvedValue([{ status: RewardClaimStatus.PENDING }]);

      await expect(
        service.create({
          userId: 'user-id',
          event: 'event-id',
        } as any),
      ).rejects.toThrow('현재 이벤트 보상 검토중 입니다.');
    });

    it('연속 출석 체크 이벤트 보상 청구 보상 완료', async () => {
      const event = {
        id: 'event-id',
        name: '3일 연속 출석 이벤트',
        condition: '3',
        eventType: EventType.ATTENDANCE,
        startAt: new Date(),
      };

      const createdRewardClaim = {
        ...createRewardClaimDto,
        _id: 'reward-claim-id',
        save: jest.fn().mockResolvedValue({
          ...createRewardClaimDto,
          _id: 'reward-claim-id',
          status: RewardClaimStatus.SUCCESS,
          operatorBy: 'SYSTEM',
        }),
      };

      // 연속 출석 체크 이벤트 반환
      eventProcessService.findOneById.mockResolvedValue(event as any);
      // 이벤트 보상 청구 내역 없음 - 최초 보상 청구
      rewardClaimModel.find.mockResolvedValue([]);
      // 연속 출석 체크 성공
      eventAttendanceService.verifyConsecutiveAttendanceFromDate.mockResolvedValue({
        success: true,
      } as any);

      // create는 저장 전 객체 반환
      rewardClaimModel.create.mockResolvedValue(createdRewardClaim);

      const result = await service.create(createRewardClaimDto);

      expect(createRewardClaimDto.status).toBe(RewardClaimStatus.SUCCESS);
      expect(createRewardClaimDto.operatorBy).toBe('SYSTEM');
    });

    it('연속 출석 체크 이벤트 보상 청구 보상 실패', async () => {
      const event = {
        id: 'event-id',
        name: '3일 연속 출석 이벤트',
        condition: '3',
        eventType: EventType.ATTENDANCE,
        startAt: new Date(),
      };

      const createdRewardClaim = {
        ...createRewardClaimDto,
        _id: 'reward-claim-id',
        save: jest.fn().mockResolvedValue({
          ...createRewardClaimDto,
          _id: 'reward-claim-id',
          status: RewardClaimStatus.SUCCESS,
          operatorBy: 'SYSTEM',
        }),
      };

      // 연속 출석 체크 이벤트 반환
      eventProcessService.findOneById.mockResolvedValue(event as any);
      // 이벤트 보상 청구 내역 없음 - 최초 보상 청구
      rewardClaimModel.find.mockResolvedValue([]);
      // 연속 출석 체크 실패
      eventAttendanceService.verifyConsecutiveAttendanceFromDate.mockResolvedValue({
        success: false,
      } as any);

      // create는 저장 전 객체 반환
      rewardClaimModel.create.mockResolvedValue(createdRewardClaim);

      const result = await service.create(createRewardClaimDto);

      expect(createRewardClaimDto.status).toBe(RewardClaimStatus.FAILURE);
    });
  });

  describe('이벤트 보상 요구 처리', () => {
    const manuallyProcessingDto = {
      rewardClaimId: 'reward-claim-id',
      status: RewardClaimStatus.SUCCESS,
      failReason: '',
      operatorBy: 'operator-user-id',
    };

    it('존재하지 않은 보상 요구', async () => {
      // 존재하지 않은 보상 요구 - null 반환
      rewardClaimModel.findById.mockResolvedValue(null as any);

      await expect(
        service.rewardClaimProcessing(manuallyProcessingDto),
      ).rejects.toThrow(RpcException);
    });

    it('이벤트 보상 요구 처리', async () => {
      // 요청된 이벤트 보상 요구
      const rewardClaim = {
        event: 'event-id',
        userId: 'user-id',
        status: RewardClaimStatus.PENDING,
      };

      rewardClaimModel.findById
        .mockResolvedValueOnce(rewardClaim as any)
        // 두번째 호출
        .mockResolvedValueOnce({ ...rewardClaim, ...manuallyProcessingDto }); 

      rewardClaimModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined),
      });

      const result = await service.rewardClaimProcessing(manuallyProcessingDto);
      if (!result) {
        fail('이벤트 보상 요구 처리 결과 => null');
      }

      expect(result.status).toBe(RewardClaimStatus.SUCCESS);
      expect(result.operatorBy).toBe('operator-user-id');
    });
  });
});
