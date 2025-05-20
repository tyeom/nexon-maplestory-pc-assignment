import { AUTH_SERVICE } from '@app/common';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GetUsersDto } from './dto/get-users-dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authMicroservice: ClientProxy,
  ) {}

  async findOneById(id: string) {
    // Auth Service에 유저 조회 요청
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.authMicroservice.send({ cmd: 'get-user-by-id' }, id),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('유저 정보 조회 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async create(createUserDto: CreateUserDto) {
    // Auth Service에 신규 유저 등록 요청
    // eslint-disable-next-line no-useless-catch
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.authMicroservice.send({ cmd: 'user-create' }, createUserDto),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('신규 유저 등록 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }

  async update(updateUserDto: UpdateUserDto, user: UserDto) {
    // Auth Service에 유저 정보 변경 요청
    // eslint-disable-next-line no-useless-catch
    try {
      const payload = { ...updateUserDto, userDto: user };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.authMicroservice.send({ cmd: 'user-update' }, payload),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('유저 정보 변경 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateRole(updateRoleDto: UpdateRoleDto) {
    // Auth Service에 유저 권한 변경 요청
    // eslint-disable-next-line no-useless-catch
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.authMicroservice.send({ cmd: 'role-update' }, updateRoleDto),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('유저 권한 정보 변경 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }

  async findAll(dto: GetUsersDto) {
    // Auth Service에 유저 정보 조회 요청
    // eslint-disable-next-line no-useless-catch
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.authMicroservice.send({ cmd: 'get-all-users' }, dto),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('유저 조회 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }
}
