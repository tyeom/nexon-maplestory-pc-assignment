import { Module } from '@nestjs/common';
import { EventProcessService } from './event-process.service';
import { EventProcessController } from './event-process.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schema/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Event.name,
        schema: EventSchema,
      },
    ]),
  ],
  controllers: [EventProcessController],
  providers: [EventProcessService],
  exports: [EventProcessService],
})
export class EventProcessModule {}
