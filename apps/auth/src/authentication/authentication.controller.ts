import { Controller, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserSignInDto } from './dto/user-sign-in.dto';

@Controller()
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @MessagePattern({
    cmd: 'sign-in',
  })
  signIn(@Payload() userSignInDto: UserSignInDto) {
    try {
      return this.authenticationService.signIn(userSignInDto);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
