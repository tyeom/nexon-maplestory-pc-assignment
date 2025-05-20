import { Test, TestingModule } from '@nestjs/testing';
import { RewardService } from './reward.service';
import { getModelToken } from '@nestjs/mongoose';
import { Reward } from './schema/reward .schema';
import { EventProcessService } from '../event-process/event-process.service';
import { RpcException } from '@nestjs/microservices';
import { RewardType } from '@app/common';

describe('RewardService', () => {
  let service: RewardService;
  let rewardModel: any;
  let eventProcessService: jest.Mocked<EventProcessService>;

  beforeEach(async () => {
    const mockRewardModel = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    };

    const mockEventProcessService = {
      findOneById: jest.fn(),
      findOneByName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardService,
        {
          provide: getModelToken(Reward.name),
          useValue: mockRewardModel,
        },
        {
          provide: EventProcessService,
          useValue: mockEventProcessService,
        },
      ],
    }).compile();

    service = module.get<RewardService>(RewardService);
    rewardModel = module.get(getModelToken(Reward.name));
    eventProcessService = module.get(EventProcessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('이벤트 보상 생성', () => {
    const createRewardDto = {
      event: 'event-id',
      rewardType: RewardType.POINT,
      amount: 3000,
      description: '',
      createdBy: 'admin',
      updatedBy: 'admin',
    };

    it('존재하지 않는 이벤트 ID인 경우 RpcException 기대', async () => {
      // 존재하지 않는 이벤트 - null 반환
      eventProcessService.findOneById.mockResolvedValue(null as any);

      await expect(service.create(createRewardDto)).rejects.toThrow(
        RpcException,
      );
    });

    it('존재하는 이벤트 ID인 경우 저장하고 결과 반환', async () => {
      const createdReward = {
        ...createRewardDto,
        _id: 'reward-id',
        save: jest.fn().mockResolvedValue({
          ...createRewardDto,
          _id: 'reward-id',
        }),
      };

      // 존재하는 이벤트
      eventProcessService.findOneById.mockResolvedValue({ _id: 'event-id' } as any);

      // create는 저장 전 객체 반환
      rewardModel.create.mockResolvedValue(createdReward);

      const result = await service.create(createRewardDto);

      // save 메서드 호출 되었는지
      expect(createdReward.save).toHaveBeenCalled();
      expect(result).toEqual({
        ...createRewardDto,
        _id: 'reward-id',
      });
    });
  });
});
