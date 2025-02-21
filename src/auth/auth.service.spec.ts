import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            getUserByEmail: jest.fn(),
            createUser: jest.fn(),
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
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerUserDto: RegisterUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        ...registerUserDto,
        password: await bcryptjs.hash(registerUserDto.password, 10),
      };

      // Mockear el método getUserByEmail para devolver null (usuario no existe)
      (usersService.getUserByEmail as jest.Mock).mockResolvedValue(null);

      // Mockear el método createUser para devolver el usuario creado
      (usersService.createUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.register(registerUserDto);

      expect(result).toEqual({
        name: 'Test User',
        email: 'test@example.com',
      });

      expect(usersService.getUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(usersService.createUser).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: expect.any(String), // La contraseña se hashea, por lo que no podemos compararla directamente
      });
    });

    it('should throw BadRequestException if user already exists', async () => {
      const registerUserDto: RegisterUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // Mockear el método getUserByEmail para devolver un usuario (usuario ya existe)
      (usersService.getUserByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        ...registerUserDto,
      });

      await expect(authService.register(registerUserDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(usersService.getUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });
  });

  describe('login', () => {
    it('should return a token if credentials are valid', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: await bcryptjs.hash('password123', 10),
        role: 'user',
      };

      // Mockear el método getUserByEmail para devolver el usuario
      (usersService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      // Mockear el método signAsync del JwtService para devolver un token
      (jwtService.signAsync as jest.Mock).mockResolvedValue('mockToken');

      const result = await authService.login(loginUserDto);

      expect(result).toEqual({
        access_token: 'mockToken',
        email: 'test@example.com',
      });

      expect(usersService.getUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: 'test@example.com',
        role: 'user',
      });
    });

    it('should throw UnauthorizedException if email is wrong', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      // Mockear el método getUserByEmail para devolver null (usuario no existe)
      (usersService.getUserByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(usersService.getUserByEmail).toHaveBeenCalledWith(
        'wrong@example.com',
      );
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: await bcryptjs.hash('password123', 10),
        role: 'user',
      };

      // Mockear el método getUserByEmail para devolver el usuario
      (usersService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(usersService.getUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });
  });
});
