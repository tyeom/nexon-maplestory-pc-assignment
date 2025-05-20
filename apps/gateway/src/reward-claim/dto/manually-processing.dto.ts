import { RewardClaimStatus } from '@app/common';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ManuallyProcessingDto {
  /**
   * RewardClaim Id
   */
  @IsNotEmpty()
  @IsMongoId()
  rewardClaimId: string;

  @IsNotEmpty()
  @IsEnum(RewardClaimStatus)
  status: RewardClaimStatus;

  @IsOptional()
  @IsString()
  failReason?: string;
}
