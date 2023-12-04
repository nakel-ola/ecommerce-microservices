import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '@app/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let token: string;
    if (context.getType() === 'rpc') {
      token = context.switchToRpc().getData().Authentication;
    } else if (context.getType() === 'http') {
      token = this.extractTokenFromHeader(context.switchToHttp().getRequest());
    }

    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });

      const user = await this.prisma.user.findFirst({
        where: { uid: payload.sub },
        select: {
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          uid: true,
        },
      });

      if (!user) new UnauthorizedException();
      this.addUser(user, context);
    } catch (e) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] =
      (request.headers['x-access-token'] as string)?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private addUser(user: any, context: ExecutionContext) {
    if (context.getType() === 'rpc') {
      context.switchToRpc().getData().user = user;
    } else if (context.getType() === 'http') {
      context.switchToHttp().getRequest().user = user;
    }
  }
}
