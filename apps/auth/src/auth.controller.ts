import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto, RegisterAuthDto } from './dto';
import { MessagePattern } from '@nestjs/microservices';
import { User } from './users/users.type';
import { CurrentUser } from './current-user.decorator';
import { AuthGuard } from './guard/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  register(@Body() args: RegisterAuthDto) {
    return this.authService.register(args);
  }

  @Post('/login')
  login(@Body() args: LoginAuthDto) {
    return this.authService.login(args);
  }

  @UseGuards(AuthGuard)
  @MessagePattern('validate_user')
  validateUser(@CurrentUser() user: User) {
    return user;
  }
}
