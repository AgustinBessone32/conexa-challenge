/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  email: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}
