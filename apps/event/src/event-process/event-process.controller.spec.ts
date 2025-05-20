import { Test, TestingModule } from '@nestjs/testing';
import { EventProcessController } from './event-process.controller';
import { EventProcessService } from './event-process.service';

describe('EventProcessController', () => {
  let controller: EventProcessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventProcessController],
      providers: [EventProcessService],
    }).compile();

    controller = module.get<EventProcessController>(EventProcessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
