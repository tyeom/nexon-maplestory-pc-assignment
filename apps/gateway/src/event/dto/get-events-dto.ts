import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PagePaginationDto } from '../../base/dto';
import { EventType } from '@app/common';

export class GetEventsDto extends PagePaginationDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(EventType)
  eventType: EventType;

  @IsOptional()
  @IsString()
  startAt: string;

  @IsOptional()
  @IsString()
  endAt: string;

  @IsOptional()
  @IsString()
  isActive: string;
}
