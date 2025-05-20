import { RewardClaimStatus } from '@app/common';

export class CreateRewardClaimDto {
  /**
   * Event Id
   */
  event: string;

  /**
   * 요청 유저 Id
   */
  userId: string;

  /**
   * 보상 요청 상태
   */
  status: RewardClaimStatus = RewardClaimStatus.PENDING;

  /**
   * 보상 요청 실패 사유
   */
  failReason?: string | null = null;

  /**
   * 요청 처리한 운영자 Id
   */
  operatorBy?: string | null = null;
}
