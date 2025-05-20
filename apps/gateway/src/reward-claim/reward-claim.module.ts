import { Module } from '@nestjs/common';
import { RewardClaimService } from './reward-claim.service';
import { RewardClaimController } from './reward-claim.controller';

@Module({
  controllers: [RewardClaimController],
  providers: [RewardClaimService],
})
export class RewardClaimModule {}
