import { EventProcessService } from './event-process.service';
import { CreateEventProcessDto } from './dto/create-event-process.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { UpdateEventProcessDto } from './dto/update-event-process.dto';
import { GetEventsDto } from './dto/get-events-dto';

@Controller()
export class EventProcessController {
  constructor(private readonly eventProcessService: EventProcessService) {}

  @MessagePattern({
    cmd: 'event-create',
  })
  async create(@Payload() createEventProcessDto: CreateEventProcessDto) {
    return await this.eventProcessService.create(createEventProcessDto);
  }

  @MessagePattern({
    cmd: 'event-update',
  })
  async update(@Payload() updateEventProcessDto: UpdateEventProcessDto) {
    return await this.eventProcessService.update(updateEventProcessDto);
  }

  @MessagePattern({
    cmd: 'get-event-by-id',
  })
  findOneById(@Payload() id: string) {
    return this.eventProcessService.findOneById(id);
  }

  @MessagePattern({
    cmd: 'get-all-events',
  })
  getAllUsers(@Payload() dto: GetEventsDto) {
    return this.eventProcessService.findAll(dto);
  }
}
