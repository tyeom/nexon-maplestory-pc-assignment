import { EventType } from '@app/common';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumberString,
  ValidateIf,
} from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  /**
   * 이벤트 조건
   *
   * 예] 연속 출석 체크 이벤트(ATTENDANCE)인 경우 연속 출석일 수 입력
   */
  @IsNotEmpty()
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @ValidateIf((o) => o.eventType === EventType.ATTENDANCE)
  @IsNumberString(
    {},
    {
      message:
        '출석 이벤트일 경우 condition은 NumberString 형식이어야 합니다. 예] "3"',
    },
  )
  condition: string;

  @IsNotEmpty()
  @IsEnum(EventType)
  eventType: EventType;

  @IsNotEmpty()
  @IsDate()
  startAt: Date;

  @IsNotEmpty()
  @IsDate()
  endAt: Date;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
