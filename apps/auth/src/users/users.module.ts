import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RmqModule } from '@app/common';

@Module({
  imports: [RmqModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
