import {
  Controller,
  Post,
  Body,
  UseGuards,
  Put,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RBAC, RBACGuard, Role } from '@app/common';
import { JwtAuthGuard } from '../authentication/strategy/jwt.strategy';
import { UserDto } from '../user/dto/user.dto';
import { User as UserDecorator } from '../user/decorator/user-decorator';
import { GetEventsDto } from './dto/get-events-dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /**
   * 이벤트 등록 [OPERATOR 전용]
   * @param createEventDto 이벤트 정보
   * @param user 요청한 유저 정보
   * @returns 결과
   */
  @RBAC(Role.OPERATOR)
  @UseGuards(RBACGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createEventDto: CreateEventDto,
    @UserDecorator() user: UserDto,
  ) {
    return await this.eventService.create(createEventDto, user);
  }

  /**
   * 이벤트 정보 수정
   * @param id 이벤트 id
   * @param updateEventDto 수정할 이벤트 정보
   * @param user 요청한 유저 정보
   * @returns 결과
   */
  @RBAC(Role.OPERATOR)
  @UseGuards(RBACGuard)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UserDecorator() user: UserDto,
  ) {
    return await this.eventService.update(id, updateEventDto, user);
  }

  /**
   * 모든 이벤트 조회
   * @param dto 조회 파라메터
   * @param user 요청한 유저 정보
   * @returns 조회 결과
   */
  @RBAC(Role.OPERATOR)
  @UseGuards(RBACGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllEvents(
    @Query() dto: GetEventsDto,
    @UserDecorator() user: UserDto,
  ) {
    return await this.eventService.findAll(dto);
  }

  /**
   * 이벤트 상세 보기 - 연결된 보상 정보 보기
   * @param id 이벤트 id
   * @param user 요청한 유저 정보
   * @returns 이벤트 상세 정보
   */
  @RBAC(Role.OPERATOR)
  @UseGuards(RBACGuard)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getEvent(@Param('id') id: string, @UserDecorator() user: UserDto) {
    return await this.eventService.detailEvent(id);
  }

  /**
   * 유저 출석 체크 [유저 전용]
   * @param user 요청한 유저 정보
   * @returns 결과
   */
  @RBAC(Role.USER)
  @UseGuards(RBACGuard)
  @UseGuards(JwtAuthGuard)
  @Post('attendance')
  async attendance(@UserDecorator() user: UserDto) {
    return await this.eventService.attendance(user);
  }
}
