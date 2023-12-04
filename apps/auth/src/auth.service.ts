import { PrismaService } from '@app/common';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { LoginAuthDto, RegisterAuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { MessageType, SignTokenType } from './auth.type';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
  ) {}
  async register(args: RegisterAuthDto): Promise<MessageType> {
    const { name, email, password } = args;

    // searching database if user with username or email is already registered
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    // if user already exists then throw an error
    if (user)
      throw new ConflictException('Account already exists, please login');

    // hashing user password
    const hash = await this.hashPassword(password);

    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hash,
      },
    });

    // checking if there was an error creating user if there was throw an error
    if (!newUser)
      throw new BadRequestException(
        'A server error has occured, please try again',
      );
    // then return a success message
    return { message: 'Registration successfull, Please verify your email' };
  }

  async login(args: LoginAuthDto) {
    const { email, password } = args;

    // searching database if user with email is already registered
    const user = await this.prisma.user.findFirst({
      where: { email },
      select: { password: true, uid: true },
    });

    // if user does not exists then throw an error
    if (!user) throw new ConflictException('Invalid credentials');

    // if user exists then compare if stored password matches with input password
    await this.comparePassword(password, user.password);

    // if password match create an access token and refresh token
    const tokens = await this.signTokens(user.uid, email);

    // then return the access token and refresh token
    return tokens;
  }

  private async hashPassword(password: string) {
    // generating password hash salt
    const salt = await bcrypt.genSalt();

    // hashing user password
    const hash = await bcrypt.hash(password, salt);

    return hash;
  }

  private async comparePassword(password: string, encryptedPassword: string) {
    // if user exists then compare if stored password matches with input password
    const isPassword = await bcrypt.compare(password, encryptedPassword);

    // if passwords does not match throw an error
    if (!isPassword) throw new ConflictException('Invalid credentials');

    return true;
  }

  private async signTokens(sub: string, email: string) {
    const accessToken = await this.signToken({
      sub,
      email,
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('ACCESS_EXPIRES_IN'),
    });
    const refreshToken = await this.signToken({
      sub,
      email,
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('REFRESH_EXPIRES_IN'),
    });

    return { accessToken, refreshToken };
  }

  private async signToken(args: SignTokenType) {
    const { sub, email, secret, expiresIn } = args;
    const token = await this.jwtService.signAsync(
      { sub, email },
      { secret, expiresIn },
    );

    return token;
  }
}
