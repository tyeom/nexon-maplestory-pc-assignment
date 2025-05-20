import { Test, TestingModule } from '@nestjs/testing';
import { EventProcessService } from './event-process.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { Event } from './schema/event.schema';
import { EventType } from '@app/common';

describe('EventProcessService', () => {
  let service: EventProcessService;
  let eventModel: any;

  beforeEach(async () => {
    const mockEventModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventProcessService,
        ConfigService,
        {
          provide: getModelToken(Event.name),
          useValue: mockEventModel,
        },
      ],
    }).compile();

    service = module.get<EventProcessService>(EventProcessService);
    eventModel = module.get(getModelToken(Event.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('이벤트 생성', () => {
    const createEventProcessDto = {
      name: '이벤트A',
      condition: '출석 3일 연속',
      eventType: EventType.ATTENDANCE,
      startAt: new Date(),
      endAt: new Date(),
      isActive: true,
      createdBy: 'admin',
      updatedBy: 'admin',
    };

    it('이미 등록된 이벤트 이름이면 RpcException 기대', async () => {
      // duplicate dto
      const duplicateDto = {
        name: '이벤트A',
        condition: '출석 3일 연속',
        eventType: EventType.ATTENDANCE,
        startAt: new Date(),
        endAt: new Date(),
        isActive: true,
        createdBy: 'admin',
        updatedBy: 'admin',
      };
      eventModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(duplicateDto),
      });

      await expect(service.create(createEventProcessDto)).rejects.toThrow(
        RpcException,
      );
      expect(eventModel.findOne).toHaveBeenCalledWith({
        name: duplicateDto.name,
      });
    });

    it('중복되지 않은 이벤트 저장하고 결과 반환', async () => {
      const createdEvent = {
        ...createEventProcessDto,
        _id: 'event-id',
        save: jest.fn().mockResolvedValue({
          ...createEventProcessDto,
          _id: 'event-id',
        }),
      };

      // findOne은 null 반환, 중복 아님
      eventModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // create는 저장 전 객체 반환
      eventModel.create.mockResolvedValue(createdEvent);

      const result = await service.create(createEventProcessDto);

      // save 메서드 호출 되었는지
      expect(createdEvent.save).toHaveBeenCalled();
      expect(result).toEqual({
        ...createEventProcessDto,
        _id: 'event-id',
      });
    });
  });

  describe('이벤트 업데이트', () => {
    it('존재하지 않는 이벤트 ID인 경우 RpcException 기대', async () => {
      const createEventProcessDto = {
        id: 'nonexistent-id',
        name: '업데이트이벤트',
        condition: '출석 3일 연속',
        eventType: EventType.ATTENDANCE,
        startAt: new Date(),
        endAt: new Date(),
        isActive: true,
        createdBy: 'admin',
        updatedBy: 'admin',
      };

      // 존재하지 않는 이벤트 - null 반환
      eventModel.findById.mockReturnValue({
        where: jest.fn().mockReturnValue({
          equals: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(null),
            }),
          }),
        }),
      });

      await expect(service.update(createEventProcessDto)).rejects.toThrow(
        RpcException,
      );
    });

    it('정상적으로 이벤트를 업데이트하고 결과 반환', async () => {
      const createEventProcessDto = {
        id: 'event-id',
        name: '업데이트이벤트',
        condition: '아이템 증정',
        eventType: EventType.ATTENDANCE,
        startAt: new Date(),
        endAt: new Date(),
        isActive: true,
        createdBy: 'admin',
        updatedBy: 'admin',
      };

      const existingEvent = { _id: createEventProcessDto.id, name: '이벤트A' };
      const updatedEvent = { ...existingEvent, name: createEventProcessDto.name };

      // eventModel.findById.mockReturnValue({
      //   where: jest.fn().mockReturnValue({
      //     equals: jest.fn().mockReturnValue({
      //       populate: jest.fn().mockReturnValue({
      //         exec: jest.fn().mockResolvedValue(existingEvent),
      //       }),
      //     }),
      //   }),
      // });

      eventModel.findById
        .mockImplementationOnce(() => ({
          where: jest.fn().mockReturnValue({
            equals: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(existingEvent),
              }),
            }),
          }),
        }))
        // 두 번째 호출은 exec()만
        .mockImplementationOnce(() => ({
          exec: jest.fn().mockResolvedValue(updatedEvent),
        }));

      eventModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.update(createEventProcessDto);

      expect(eventModel.findByIdAndUpdate).toHaveBeenCalledWith(createEventProcessDto.id, createEventProcessDto);
      expect(result).toEqual(updatedEvent);
    });
  });
});
