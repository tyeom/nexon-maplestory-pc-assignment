import { plainToClass } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { UserDto } from 'apps/auth/src/user/dto/user.dto';
import { User } from '../schema/user.schema';

@Injectable()
export class UserMapper {
  // user model -> user.dto 변환
  toDto(userModel: User): UserDto {
    const userDto = plainToClass(UserDto, userModel);
    return userDto;
  }

  // user.dto -> user model 변환
  toEntity(userDto: UserDto): User {
    const userModel = new User();
    return Object.assign(userModel, userDto);
  }
}
