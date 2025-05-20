import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { EVENT_SERVICE } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { UserDto } from '../user/dto/user.dto';
import { lastValueFrom } from 'rxjs';
import { DeleteRewardDto } from './dto/delete-reward.dto';

@Injectable()
export class RewardService {
  constructor(
    @Inject(EVENT_SERVICE)
    private readonly eventMicroservice: ClientProxy,
  ) {}

  async create(createRewardDto: CreateRewardDto, user: UserDto) {
    // eslint-disable-next-line no-useless-catch
    try {
      const payload = { ...createRewardDto, createdBy: user.email };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.eventMicroservice.send({ cmd: 'reward-create' }, payload),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('보상 등록 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateRewardDto: UpdateRewardDto, user: UserDto) {
    // eslint-disable-next-line no-useless-catch
    try {
      const payload = { ...updateRewardDto, id: id, updatedBy: user.email };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.eventMicroservice.send({ cmd: 'reward-update' }, payload),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('보상 수정 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string, user: UserDto) {
    // eslint-disable-next-line no-useless-catch
    try {
      const deleteRewardDto: DeleteRewardDto = new DeleteRewardDto();
      deleteRewardDto.id = id;
      deleteRewardDto.createdBy = user.email;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.eventMicroservice.send({ cmd: 'reward-delete' }, deleteRewardDto),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('보상 정보 삭제 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }
}
