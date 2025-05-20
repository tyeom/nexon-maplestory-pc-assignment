import { Controller } from '@nestjs/common';
import { RewardService } from './reward.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { DeleteRewardDto } from './dto/delete-reward.dto';

@Controller('reward')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @MessagePattern({
    cmd: 'reward-create',
  })
  async create(@Payload() createRewardDto: CreateRewardDto) {
    return await this.rewardService.create(createRewardDto);
  }

  @MessagePattern({
    cmd: 'reward-update',
  })
  async update(@Payload() updateRewardDto: UpdateRewardDto) {
    return await this.rewardService.update(updateRewardDto);
  }

  @MessagePattern({
    cmd: 'reward-delete',
  })
  async delete(@Payload() deleteRewardDto: DeleteRewardDto) {
    return await this.rewardService.delete(deleteRewardDto);
  }
}
