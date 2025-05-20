import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenResponseDto } from './dto/token-response.dto';
import { UserSignInDto } from './dto/user-sign-in.dto';
import { lastValueFrom } from 'rxjs';
import { AUTH_SERVICE } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authMicroservice: ClientProxy,
  ) {}

  parseBasicToken(rawToken: string) {
    // 1. ['Basic', $token]
    const basicSplit = rawToken.split(' ');

    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
    }

    const [basic, token] = basicSplit;

    if (basic.toLowerCase() !== 'basic') {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
    }

    // 2. decode base64 [email, password]
    const decoded = Buffer.from(token, 'base64').toString('utf-8');

    // 3. split token
    // "email:password"
    // [email, password]
    const tokenSplit = decoded.split(':');

    if (tokenSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
    }

    const [email, password] = tokenSplit;

    return {
      email,
      password,
    };
  }

  async signIn(token: string): Promise<TokenResponseDto> {
    const { email, password } = this.parseBasicToken(token);
    const userSignInDto = new UserSignInDto();
    userSignInDto.email = email;
    userSignInDto.password = password;

    // Auth Service에 엑세스 토큰 발급 요청
    // eslint-disable-next-line no-useless-catch
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.authMicroservice.send({ cmd: 'sign-in' }, userSignInDto),
      );

      if (!response || response === '') {
        throw new UnauthorizedException('로그인에 실패했습니다!');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }
}
