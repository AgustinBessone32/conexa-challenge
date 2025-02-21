/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from '../users/users.service';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register({ name, email, password }: RegisterUserDto) {
    const user = await this.userService.getUserByEmail(email);

    if (user) {
      throw new BadRequestException(`User already exists`);
    }

    const newUser: User = await this.userService.createUser({
      name,
      email,
      password: await bcryptjs.hash(password, 10),
    });

    const { id, password: _, ...newUserResponse } = newUser;

    return newUserResponse;
  }

  async login({ email, password }: LoginUserDto) {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException(`Email is wrong`);
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException(`Password is wrong`);
    }

    const payload = { email: user.email, role: user.role };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      email,
    };
  }
}
