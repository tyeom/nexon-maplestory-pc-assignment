import { RewardType } from '@app/common';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRewardDto {
  /**
   * Event Id
   */
  @IsNotEmpty()
  @IsMongoId()
  event: string;

  @IsNotEmpty()
  @IsEnum(RewardType)
  rewardType: RewardType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
