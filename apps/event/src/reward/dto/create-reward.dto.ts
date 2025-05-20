import { RewardType } from '@app/common';

export class CreateRewardDto {
  /**
   * Event Id
   */
  event: string;
  rewardType: RewardType;
  amount?: number;
  description?: string;
  createdBy: string;
  updatedBy: string;
}
