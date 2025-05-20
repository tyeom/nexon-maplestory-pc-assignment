import { EventType, RewardClaimStatus } from '@app/common';
import { PagePaginationDto } from '../../base/dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class GetRewardClaimsDto extends PagePaginationDto {
  @IsOptional()
  @IsString()
  userEmail: string;

  @IsOptional()
  @IsString()
  status: RewardClaimStatus;

  @IsOptional()
  @IsString()
  eventName: string;

  @IsOptional()
  @IsEnum(EventType)
  eventType: EventType;
}

export class GetRewardClaimsByUserDto extends PagePaginationDto {
  @IsOptional()
  @IsString()
  status: RewardClaimStatus;

  @IsOptional()
  @IsString()
  eventName: string;

  @IsOptional()
  @IsEnum(EventType)
  eventType: EventType;
}
