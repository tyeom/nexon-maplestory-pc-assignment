import { Module } from '@nestjs/common';
import { RewardClaimService } from './reward-claim.service';
import { RewardClaimController } from './reward-claim.controller';
import { EventProcessModule } from '../event-process/event-process.module';
import { RewardModule } from '../reward/reward.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardClaim, RewardClaimSchema } from './schema/reward-claim .schema';
import { EventAttendanceModule } from '../event-attendance/event-attendance.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RewardClaim.name,
        schema: RewardClaimSchema,
      },
    ]),
    EventProcessModule,
    RewardModule,
    EventAttendanceModule,
  ],
  controllers: [RewardClaimController],
  providers: [RewardClaimService],
})
export class RewardClaimModule {}
