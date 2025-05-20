import { Injectable } from '@nestjs/common';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { EventProcessService } from '../event-process/event-process.service';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model } from 'mongoose';
import { Reward } from './schema/reward .schema';
import { DeleteRewardDto } from './dto/delete-reward.dto';

@Injectable()
export class RewardService {
  constructor(
    private readonly eventProcessService: EventProcessService,
    @InjectModel(Reward.name)
    private readonly rewardModel: Model<Reward>,
  ) {}

  async create(createRewardDto: CreateRewardDto) {
    const eventId = createRewardDto.event;
    const event = await this.eventProcessService.findOneById(eventId);

    if (!event) {
      throw new RpcException('등록된 이벤트가 없습니다.');
    }

    const created = await this.rewardModel.create(createRewardDto);
    return await created.save();
  }

  async findOneById(id: string) {
    const reward = await this.rewardModel.findById(id);
    if (!reward) {
      throw new RpcException('존재하지 않는 보상 입니다.');
    }

    return reward;
  }

  async findByEventName(eventName: string) {
    const event = await this.eventProcessService.findOneByName(eventName);

    if (!event) {
      throw new RpcException('존재하지 이벤트 입니다.');
    }

    const reward = await this.rewardModel.find({ event }).exec();
    if (!reward) {
      throw new RpcException('존재하지 않는 보상 입니다.');
    }

    return reward;
  }

  async update(updateRewardDto: UpdateRewardDto) {
    const foundReward = await this.findOneById(updateRewardDto.id);
    if (!foundReward) {
      throw new RpcException('존재하지 않는 보상 입니다.');
    }

    await this.rewardModel
      .findByIdAndUpdate(foundReward._id, updateRewardDto)
      .exec();
    return this.rewardModel.findById(foundReward._id);
  }

  async delete(deleteRewardDto: DeleteRewardDto): Promise<DeleteResult> {
    const { id, createdBy } = deleteRewardDto;
    return await this.rewardModel.deleteOne({ _id: id, createdBy }).exec();
  }
}
