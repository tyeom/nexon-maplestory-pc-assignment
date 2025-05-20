import { EventType } from '@app/common';
import { PagePaginationDto } from '../../base/dto';

export class GetEventsDto extends PagePaginationDto {
  name: string;
  eventType: EventType;
  startAt: string;
  endAt: string;
  isActive: string;
}
