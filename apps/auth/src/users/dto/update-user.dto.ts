import { MinLength } from 'class-validator';

export class UpdateUserDto {
  @MinLength(3)
  name: string;
}
