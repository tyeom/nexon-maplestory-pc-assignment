import { Injectable } from '@nestjs/common';
import { CreateEventProcessDto } from './dto/create-event-process.dto';
import { UpdateEventProcessDto } from './dto/update-event-process.dto';
import { Event } from './schema/event.schema';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RpcException } from '@nestjs/microservices';
import { GetEventsDto } from './dto/get-events-dto';
import { Reward } from '../reward/schema/reward .schema';

interface EventWithRewards extends Event {
  rewards: Reward[];
}

@Injectable()
export class EventProcessService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,
  ) {}

  async create(createEventProcessDto: CreateEventProcessDto) {
    const eventDto = createEventProcessDto;
    const event = await this.eventModel.findOne({ name: eventDto.name }).exec();

    if (event) {
      throw new RpcException('이미 등록된 이벤트 입니다.');
    }

    const created = await this.eventModel.create(createEventProcessDto);
    return await created.save();
  }

  async findOneById(id: string): Promise<EventWithRewards> {
    const event = await this.eventModel
      .findById(id)
      .where('isActive')
      .equals(true)
      .populate('rewards')
      .exec();
    if (!event) {
      throw new RpcException('존재하지 않는 이벤트 입니다.');
    }

    return event as unknown as EventWithRewards;
  }

  async findOneByName(name: string) {
    const event = await this.eventModel
      .findOne({ name, isActive: true })
      .exec();
    return event;
  }

  async findByName(name: string) {
    const events = await this.eventModel
      .find({
        name: { $regex: name, $options: 'i' },
        isActive: true,
      })
      .exec();

    return events;
  }

  async update(updateEventProcessDto: UpdateEventProcessDto) {
    const foundEvent = await this.eventModel
      .findById(updateEventProcessDto.id)
      .populate('rewards')
      .exec();
    if (!foundEvent) {
      throw new RpcException('존재하지 않는 이벤트 입니다.');
    }

    await this.eventModel
      .findByIdAndUpdate(foundEvent._id, updateEventProcessDto)
      .exec();
    return this.eventModel.findById(foundEvent._id).exec();
  }

  async findAll(getEventsDto: GetEventsDto) {
    const {
      page = 1,
      take = 25,
      name,
      eventType,
      startAt,
      endAt,
      isActive,
    } = getEventsDto;
    const skip = (page - 1) * take;

    const filter: any = {};

    // name or isActive
    if (name || eventType || isActive) {
      filter.$or = [];

      if (name) {
        filter.$or.push({ name: { $regex: name, $options: 'i' } });
      }

      if (eventType) {
        filter.$or.push({ eventType });
      }

      if (isActive) {
        filter.$or.push({ isActive });
      }

      // 값이 없으면 삭제
      if (filter.$or.length === 0) {
        delete filter.$or;
      }
    }

    // AND 기간 검색
    if (startAt && endAt) {
      filter.startAt = { $lte: new Date(`${endAt}T23:59:59.999Z`) };
      filter.endAt = { $gte: new Date(`${startAt}T00:00:00.000Z`) };
    }

    // 데이터 및 전체 개수 조회
    const [data, total] = await Promise.all([
      this.eventModel
        .find(filter)
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .exec(),
      this.eventModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }
}
