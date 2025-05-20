import {
  Controller,
  Post,
  UseGuards,
  Param,
  Query,
  Get,
  Patch,
  Body,
} from '@nestjs/common';
import { RewardClaimService } from './reward-claim.service';
import { RBAC, RBACGuard, Role } from '@app/common';
import { UserDto } from '../user/dto/user.dto';
import { User as UserDecorator } from '../user/decorator/user-decorator';
import { JwtAuthGuard } from '../authentication/strategy/jwt.strategy';
import {
  GetRewardClaimsByUserDto,
  GetRewardClaimsDto,
} from './dto/get-reward-claims-dto';
import { ManuallyProcessingDto } from './dto/manually-processing.dto';

@Controller('reward-claim')
export class RewardClaimController {
  constructor(private readonly rewardClaimService: RewardClaimService) {}

  /**
   * 이벤트 보상 청구
   * @param eventId 이벤트트 Id
   * @param user 요청한 유저 정보
   * @returns 결과
   */
  @RBAC(Role.USER)
  @UseGuards(RBACGuard)
  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async create(@Param('id') eventId: string, @UserDecorator() user: UserDto) {
    return await this.rewardClaimService.create(eventId, user);
  }

  /**
   * 이벤트 보상 청구 내역 조회 [유저용]
   *
   * 본인 청구 내역 조회
   * @param dto 검색 조건 정보
   * @param user 요청한 유저 정보
   * @returns 조회 결과
   */
  @RBAC(Role.USER)
  @UseGuards(RBACGuard)
  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getAllRewardClaimByUser(
    @Query() dto: GetRewardClaimsByUserDto,
    @UserDecorator() user: UserDto,
  ) {
    return await this.rewardClaimService.findAllByUser(dto, user);
  }

  /**
   * 이벤트 보상 청구 내역 조회 [운영자 전용]
   * @param dto 검색 조건 정보
   * @param user 요청한 유저 정보
   * @returns 조회 결과
   */
  @RBAC(Role.AUDITOR, Role.OPERATOR)
  @UseGuards(RBACGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllRewardClaim(
    @Query() dto: GetRewardClaimsDto,
    @UserDecorator() user: UserDto,
  ) {
    return await this.rewardClaimService.findAll(dto);
  }

  /**
   * 이벤트 보상 청구 수동 처리
   * @param dto 보상 청구 처리 정보
   * @param user 요청한 유저 정보
   * @returns 결과
   */
  @RBAC(Role.OPERATOR)
  @UseGuards(RBACGuard)
  @UseGuards(JwtAuthGuard)
  @Patch('manually-processing')
  async manuallyProcessing(
    @Body() dto: ManuallyProcessingDto,
    @UserDecorator() user: UserDto,
  ) {
    return await this.rewardClaimService.manuallyProcessing(dto, user);
  }
}
