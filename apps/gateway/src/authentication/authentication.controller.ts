import { Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Authorization } from '@app/common';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  /**
   * 유저 인증 [로그인]
   * @param token Basic token [email:password]
   * @returns 엑세스 토큰
   */
  @Post('sign-in')
  async signIn(@Authorization() token: string) {
    try {
      return await this.authenticationService.signIn(token);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
