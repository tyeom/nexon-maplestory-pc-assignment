import { BadRequestException, Injectable } from '@nestjs/common';
import { TokenResponseDto } from './dto/token-response.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from '../user/schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '@app/common';
import { UserSignInDto } from './dto/user-sign-in.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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

  async authValidation(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      return null;
    }

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return null;
    }

    return user;
  }

  async issueToken(user: { _id: any, role: Role }) {
    const secretKey = this.configService.get<string>('JWT_SECRET_KEY');

    return this.jwtService.signAsync(
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        sub: user._id,
        role: user.role,
      },
      {
        secret: secretKey,
        expiresIn: '24h',
      },
    );
  }

  async signIn(userSignInDto: UserSignInDto): Promise<TokenResponseDto | null> {
    const { email, password } = userSignInDto;
    const user = await this.authValidation(email, password);
    if (!user) {
      return null;
    }

    const tokenResponseDto = new TokenResponseDto();
    tokenResponseDto.token = await this.issueToken(user);
    return tokenResponseDto;
  }
}
