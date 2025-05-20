import { Controller } from '@nestjs/common';
import { EventAttendanceService } from './event-attendance.service';
import { CreateEventAttendanceDto } from './dto/create-event-attendance.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('event-attendance')
export class EventAttendanceController {
  constructor(
    private readonly eventAttendanceService: EventAttendanceService,
  ) {}

  @MessagePattern({
    cmd: 'event-attendance',
  })
  async checkIn(@Payload() createEventAttendanceDto: CreateEventAttendanceDto) {
    return await this.eventAttendanceService.checkIn(createEventAttendanceDto);
  }
}
