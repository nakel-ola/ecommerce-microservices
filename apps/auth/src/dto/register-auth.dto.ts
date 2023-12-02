import { IsEmail, IsStrongPassword, MinLength } from 'class-validator';

export class RegisterAuthDto {
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}
