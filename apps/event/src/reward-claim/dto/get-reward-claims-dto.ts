import { EventType, RewardClaimStatus } from '@app/common';
import { PagePaginationDto } from '../../base/dto';

export class GetRewardClaimsDto extends PagePaginationDto {
  userEmail: string;
  status: RewardClaimStatus;
  eventName: string;
  eventType: EventType;
}

export class GetRewardClaimsByUserDto extends PagePaginationDto {
  userId: string;
  status: RewardClaimStatus;
  eventName: string;
  eventType: EventType;
}
