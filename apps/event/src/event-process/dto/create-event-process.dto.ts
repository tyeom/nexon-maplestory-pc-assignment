import { EventType } from '@app/common';

export class CreateEventProcessDto {
  name: string;
  description?: string;
  /**
   * 이벤트 조건
   *
   * 예] 연속 출석 체크 이벤트(ATTENDANCE)인 경우 연속 출석일 수 입력
   */
  condition: string;
  eventType: EventType;
  startAt: Date;
  endAt: Date;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
}
