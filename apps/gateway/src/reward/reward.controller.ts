import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { RewardService } from './reward.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RBAC, RBACGuard, Role } from '@app/common';
import { UserDto } from '../user/dto/user.dto';
import { User as UserDecorator } from '../user/decorator/user-decorator';
import { JwtAuthGuard } from '../authentication/strategy/jwt.strategy';

@Controller('reward')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  /**
   * 이벤트 보상 등록
   * @param createRewardDto 보상 정보
   * @param user 요청한 유저 정보
   * @returns 결과
   */
  @RBAC(Role.OPERATOR)
  @UseGuards(RBACGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createRewardDto: CreateRewardDto,
    @UserDecorator() user: UserDto,
  ) {
    return await this.rewardService.create(createRewardDto, user);
  }

  /**
   * 보상 정보 수정
   * @param id 이벤트 보상 id
   * @param updateRewardDto 수정할 보상 정보
   * @param user 요청한 유저 정보
   * @returns 결과
   */
  @RBAC(Role.OPERATOR)
  @UseGuards(RBACGuard)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRewardDto: UpdateRewardDto,
    @UserDecorator() user: UserDto,
  ) {
    return await this.rewardService.update(id, updateRewardDto, user);
  }

  /**
   * 이벤트 보상 삭제
   * @param id 이벤트 보상 id
   * @param user 요청한 유저 정보
   * @returns 결과
   */
  @RBAC(Role.OPERATOR)
  @UseGuards(RBACGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @UserDecorator() user: UserDto) {
    return await this.rewardService.delete(id, user);
  }
}
