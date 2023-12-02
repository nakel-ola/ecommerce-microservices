import { Injectable } from '@nestjs/common';
import { User } from './users.type';
import { PrismaService } from '@app/common';
import { UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async update(user: User, args: UpdateUserDto) {
    await this.prisma.user.update({
      where: { email: user.email },
      data: {
        ...args,
      },
    });

    return { message: 'User updated successfully' };
  }
}
