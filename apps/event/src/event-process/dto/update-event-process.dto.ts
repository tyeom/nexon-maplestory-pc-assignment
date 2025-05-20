import { PartialType } from '@nestjs/mapped-types';
import { CreateEventProcessDto } from './create-event-process.dto';

export class UpdateEventProcessDto extends PartialType(CreateEventProcessDto) {
  id: string;
}
