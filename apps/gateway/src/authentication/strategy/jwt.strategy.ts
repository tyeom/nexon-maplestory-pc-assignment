import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { UserMapper } from '../../user/mapper/user.mapper';

export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly userMapper: UserMapper,
  ) {
    const secretKey = configService.get<string>('JWT_SECRET_KEY');
    if (!secretKey) {
      throw new Error('JWT_SECRET_KEY is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }
  async validate(payload: Record<string, unknown>) {
    const userId = payload.sub as string;
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new UnauthorizedException('잘못되 요청 입니다.');
    }
    return this.userMapper.toDto(user);
  }
}
