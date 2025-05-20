import { Module } from '@nestjs/common';
import { EventAttendanceService } from './event-attendance.service';
import { EventAttendanceController } from './event-attendance.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Attendance, AttendanceSchema } from './schema/attendance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Attendance.name,
        schema: AttendanceSchema,
      },
    ]),
  ],
  controllers: [EventAttendanceController],
  providers: [EventAttendanceService],
  exports: [EventAttendanceService],
})
export class EventAttendanceModule {}
