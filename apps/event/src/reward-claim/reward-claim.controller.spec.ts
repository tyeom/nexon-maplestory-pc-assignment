import { Test, TestingModule } from '@nestjs/testing';
import { RewardClaimController } from './reward-claim.controller';
import { RewardClaimService } from './reward-claim.service';

describe('RewardClaimController', () => {
  let controller: RewardClaimController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardClaimController],
      providers: [RewardClaimService],
    }).compile();

    controller = module.get<RewardClaimController>(RewardClaimController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
