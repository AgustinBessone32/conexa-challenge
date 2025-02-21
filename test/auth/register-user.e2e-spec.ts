/* eslint-disable @typescript-eslint/no-misused-promises */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { UsersService } from '../../src/users/users.service';
import * as bcryptjs from 'bcryptjs';
import { Role, User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';

describe('Register User (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            getUserByEmail: jest.fn(),
            createUser: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = moduleFixture.get<AuthService>(AuthService);
    usersService = moduleFixture.get<UsersService>(UsersService);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should not include password in the response', async () => {
    const registerDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    jest.spyOn(usersService, 'createUser').mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
    } as User);

    const result = await authService.register(registerDto);

    expect(result).not.toHaveProperty('password');
  });

  it('Should register a new user', async () => {
    jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(null);

    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: Role.USER,
    };

    jest.spyOn(usersService, 'createUser').mockResolvedValue(mockUser as any);

    jest
      .spyOn(bcryptjs, 'hash')
      .mockImplementation(() => Promise.resolve('hashedPassword'));

    const registerDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const result = await authService.register(registerDto);

    expect(200);
    expect(result).toEqual({
      name: 'Test User',
      email: 'test@example.com',
      role: Role.USER,
    });
  });

  it('Should return 400 if the user already exists', async () => {
    const registerDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue({} as User);

    await expect(authService.register(registerDto)).rejects.toThrow(
      'User already exists',
    );
    expect(400);
  });

  it('Should throw an error if name, email or password is missing', async () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    await expect(authService.register(registerDto as any)).rejects.toThrow();
  });
});
