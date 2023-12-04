import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_SERVICE_OPTIONS } from '../services';
import { PrismaServiceOptions } from './interfaces';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    @Optional()
    @Inject(PRISMA_SERVICE_OPTIONS)
    private readonly prismaServiceOptions: PrismaServiceOptions = {},
  ) {
    super(prismaServiceOptions.prismaOptions);
  }

  async onModuleInit() {
    await this.$connect();
    if (this.prismaServiceOptions.explicitConnect) {
    }
  }
}
