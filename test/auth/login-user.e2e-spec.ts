/* eslint-disable @typescript-eslint/no-misused-promises */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            getUserByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('Should return an access token if credentials are valid', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'test',
      password: await bcryptjs.hash('password123', 10),
      role: Role.USER,
    };

    jest
      .spyOn(userService, 'getUserByEmail')
      .mockResolvedValue(mockUser as any);

    jest
      .spyOn(bcryptjs, 'compare')
      .mockImplementation(() => Promise.resolve(true));

    jest
      .spyOn(jwtService, 'signAsync')
      .mockImplementation(() => Promise.resolve('fakeAccessToken'));

    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = await authService.login(loginDto);

    expect(result).toEqual({
      access_token: 'fakeAccessToken',
      email: 'test@example.com',
    });

    expect(userService.getUserByEmail).toHaveBeenCalledWith(loginDto.email);
  });

  it('Should throw UnauthorizedException if user does not exist', async () => {
    jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(null);

    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    await expect(authService.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(authService.login(loginDto)).rejects.toThrow('Email is wrong');
  });

  it('Should throw UnauthorizedException if password is invalid', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'test',
      role: Role.USER,
      password: await bcryptjs.hash('password123', 10),
    };

    jest
      .spyOn(userService, 'getUserByEmail')
      .mockResolvedValue(mockUser as any);

    jest
      .spyOn(bcryptjs, 'compare')
      .mockImplementation(() => Promise.resolve(false));

    const loginDto = {
      email: 'test@example.com',
      password: 'wrongPassword',
    };

    await expect(authService.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(authService.login(loginDto)).rejects.toThrow(
      'Password is wrong',
    );
  });

  it('Should throw an error if email or password is missing', async () => {
    const loginDto = {
      email: 'test@example.com',
    };

    await expect(authService.login(loginDto as any)).rejects.toThrow(
      'Email is wrong',
    );
  });
});
