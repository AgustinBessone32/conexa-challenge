import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should call authService.register with the correct parameters', async () => {
      const registerUserDto: RegisterUserDto = {
        name: 'testuser',
        password: 'testpassword',
        email: 'test@example.com',
      };

      const expectedResult = { id: 1, ...registerUserDto };
      (authService.register as jest.Mock).mockResolvedValue(expectedResult);

      const result = await authController.register(registerUserDto);

      expect(authService.register).toHaveBeenCalledWith(registerUserDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException if email is invalid', async () => {
      const invalidDto = {
        name: 'testuser',
        password: 'testpassword',
        email: 'invalid-email',
      };

      (authService.register as jest.Mock).mockRejectedValue(
        new BadRequestException('email must be an email'),
      );

      await expect(
        authController.register(invalidDto as RegisterUserDto),
      ).rejects.toThrow(BadRequestException);

      try {
        await authController.register(invalidDto as RegisterUserDto);
      } catch (error) {
        expect(error.getResponse().message).toContain('email must be an email');
      }
    });
  });

  describe('login', () => {
    it('should call authService.login with the correct parameters', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'testpassword',
      };

      const expectedResult = { accessToken: 'someAccessToken' };
      (authService.login as jest.Mock).mockResolvedValue(expectedResult);

      const result = await authController.login(loginUserDto);

      expect(authService.login).toHaveBeenCalledWith(loginUserDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException if required fields are missing', async () => {
      const invalidDto = {
        email: 'test@example.com',
      };

      (authService.login as jest.Mock).mockRejectedValue(
        new BadRequestException('password should not be empty'),
      );

      await expect(
        authController.login(invalidDto as LoginUserDto),
      ).rejects.toThrow(BadRequestException);

      try {
        await authController.login(invalidDto as LoginUserDto);
      } catch (error) {
        expect(error.getResponse().message).toContain(
          'password should not be empty',
        );
      }
    });
  });
});
