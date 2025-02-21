import { Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });

    return user;
  }

  async createUser(user: CreateUserDto) {
    return await this.prisma.user.create({ data: user });
  }
}
