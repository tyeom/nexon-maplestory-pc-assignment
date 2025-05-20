import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { User as UserDecorator } from '../user/decorator/user-decorator';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RBAC, RBACGuard, Role } from '@app/common';
import { JwtAuthGuard } from '../authentication/strategy/jwt.strategy';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GetUsersDto } from './dto/get-users-dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 신규 유저 등록
   * @param createUserDto 신규 유저 정보
   * @returns 유저 추가 결과
   */
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  /**
   * 유저 정보 변경
   * @param updateUserDto 유저 정보
   * @param user 요청한 유저 정보
   * @returns 유저 정보 변경 결과
   */
  @RBAC(Role.USER)
  @UseGuards(RBACGuard)
  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @UserDecorator() user: UserDto,
  ) {
    return await this.userService.update(updateUserDto, user);
  }

  /**
   * 유저 권한 변경
   * @param updateRoleDto 변경한 권한 정보
   * @param user 요청한 유저 정보
   * @returns 유저 정보 변경 결과
   */
  @RBAC(Role.ADMIN)
  @UseGuards(RBACGuard)
  @UseGuards(JwtAuthGuard)
  @Patch('role')
  async updateRole(
    @Body() updateRoleDto: UpdateRoleDto,
    @UserDecorator() user: UserDto,
  ) {
    return await this.userService.updateRole(updateRoleDto);
  }

  /**
   * 내 정보 가져오기
   * @param user 요청한 유저 정보
   * @returns 사용자 정보
   */
  @RBAC(Role.USER)
  @UseGuards(RBACGuard)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@UserDecorator() user: UserDto) {
    return await this.userService.findOneById(user._id);
  }

  /**
   * 사용자 정보 조회
   * @param dto 조회 정보
   * @param user 요청한 유저 정보
   * @returns 조회 결과
   */
  @RBAC(Role.ADMIN)
  @UseGuards(RBACGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(@Query() dto: GetUsersDto, @UserDecorator() user: UserDto) {
    return await this.userService.findAll(dto);
  }
}
