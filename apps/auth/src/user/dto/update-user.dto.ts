import { Role } from '@app/common';
import { UserDto } from './user.dto';

export class UpdateUserDto {
  name: string;
  password: string;
  role: Role;
  userDto: UserDto;
}
