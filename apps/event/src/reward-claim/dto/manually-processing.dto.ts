import { RewardClaimStatus } from '@app/common';

export class ManuallyProcessingDto {
  /**
   * RewardClaim Id
   */
  rewardClaimId: string;

  status: RewardClaimStatus;

  failReason?: string;

  /**
   * 요청 처리한 운영자 Id
   */
  operatorBy: string;
}
