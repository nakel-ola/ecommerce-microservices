import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.type';
import { CurrentUser } from '../current-user.decorator';
import { AuthGuard } from '../guard/auth.guard';
import { UpdateUserDto } from './dto';

@Controller('auth/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get()
  find(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(AuthGuard)
  @Put()
  update(@CurrentUser() user: User, @Body() args: UpdateUserDto) {
    return this.usersService.update(user, args);
  }
}
