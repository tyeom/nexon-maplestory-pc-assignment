import { Test, TestingModule } from '@nestjs/testing';
import { EventAttendanceController } from './event-attendance.controller';
import { EventAttendanceService } from './event-attendance.service';

describe('EventAttendanceController', () => {
  let controller: EventAttendanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventAttendanceController],
      providers: [EventAttendanceService],
    }).compile();

    controller = module.get<EventAttendanceController>(EventAttendanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
