import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users-dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Controller } from '@nestjs/common';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 신규 유저 등록
   * @param createUserDto 신규 유저 정보
   * @returns 유저 추가 결과
   */
  @MessagePattern({
    cmd: 'user-create',
  })
  async create(@Payload() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  /**
   * 유저 정보 변경
   * @param updateUserDto 유저 정보
   * @returns 유저 정보 변경 결과
   */
  @MessagePattern({
    cmd: 'user-update',
  })
  update(@Payload() updateUserDto: UpdateUserDto) {
    return this.userService.update(updateUserDto, updateUserDto.userDto);
  }

  /**
   * 유저 권한 변경
   * @param updateRoleDto 권한 변경 유저 email
   * @returns 유저 정보 변경 결과
   */
  @MessagePattern({
    cmd: 'role-update',
  })
  updateRole(@Payload() updateRoleDto: UpdateRoleDto) {
    return this.userService.updateRole(updateRoleDto.email, updateRoleDto.role);
  }

  /**
   * 사용자 정보 조회
   * @param id 사용자 Id
   * @returns 조회 결과
   */
  @MessagePattern({
    cmd: 'get-user-by-id',
  })
  findOneById(@Payload() id: string) {
    return this.userService.findOneById(id);
  }

  /**
   * 사용자 정보 조회 By Email
   * @param email 사용자 Email
   * @returns 조회 결과
   */
  @MessagePattern({
    cmd: 'get-user-by-email',
  })
  findOneByEmail(@Payload() email: string) {
    return this.userService.findOneByEmail(email);
  }

  /**
   * 사용자 정보 조회
   * @param dto 조회 정보 [페이징 정보]
   * @returns 조회 결과
   */
  @MessagePattern({
    cmd: 'get-all-users',
  })
  getAllUsers(@Payload() dto: GetUsersDto) {
    return this.userService.findAll(dto);
  }
}
