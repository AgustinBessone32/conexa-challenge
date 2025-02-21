import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getUserByEmail', () => {
    it('should return a user if found by email', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      };

      // Mockear el método findFirst del PrismaService
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await usersService.getUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user is not found by email', async () => {
      // Mockear el método findFirst para devolver null
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await usersService.getUserByEmail(
        'nonexistent@example.com',
      );

      expect(result).toBeNull();
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      const mockUser: CreateUserDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
      };

      const createdUser = {
        id: 2,
        ...mockUser,
      };

      (prismaService.user.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await usersService.createUser(mockUser);

      expect(result).toEqual(createdUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: mockUser,
      });
    });
  });

  it('should throw an error if Prisma fails to create a user', async () => {
    const mockUser: CreateUserDto = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'password123',
    };

    (prismaService.user.create as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    );

    await expect(usersService.createUser(mockUser)).rejects.toThrow(
      'Database error',
    );
  });
});
