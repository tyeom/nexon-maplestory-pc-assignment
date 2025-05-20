import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserMapper } from './mapper/user.mapper';
import { JwtStrategy } from '../authentication/strategy/jwt.strategy';

@Module({
  controllers: [UserController],
  providers: [UserService, UserMapper, JwtStrategy],
  exports: [UserService, UserMapper],
})
export class UserModule {}
