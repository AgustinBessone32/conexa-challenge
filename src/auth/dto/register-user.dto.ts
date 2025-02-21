/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(4)
  password: string;
}
