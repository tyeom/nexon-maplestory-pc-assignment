import { Controller } from '@nestjs/common';
import { RewardClaimService } from './reward-claim.service';
import { CreateRewardClaimDto } from './dto/create-reward-claim.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  GetRewardClaimsByUserDto,
  GetRewardClaimsDto,
} from './dto/get-reward-claims-dto';
import { ManuallyProcessingDto } from './dto/manually-processing.dto';

@Controller('reward-claim')
export class RewardClaimController {
  constructor(private readonly rewardClaimService: RewardClaimService) {}

  @MessagePattern({
    cmd: 'reward-claim-create',
  })
  async create(@Payload() createRewardClaimDto: CreateRewardClaimDto) {
    return await this.rewardClaimService.create(createRewardClaimDto);
  }

  @MessagePattern({
    cmd: 'get-all-reward-claim-user',
  })
  getAllRewardClaimByUser(@Payload() dto: GetRewardClaimsByUserDto) {
    return this.rewardClaimService.findAllByUser(dto);
  }

  @MessagePattern({
    cmd: 'get-all-reward-claim',
  })
  getAllRewardClaim(@Payload() dto: GetRewardClaimsDto) {
    return this.rewardClaimService.findAll(dto);
  }

  /**
   * 요청된 보상 수동 처리
   * @param dto 보상 요청 처리 정보
   * @returns 결과
   */
  @MessagePattern({
    cmd: 'manually-processing',
  })
  rewardClaimProcessing(@Payload() dto: ManuallyProcessingDto) {
    return this.rewardClaimService.rewardClaimProcessing(dto);
  }
}
