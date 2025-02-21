import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if token is valid', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer validToken',
        },
      } as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const mockPayload = { userId: 1, email: 'test@example.com' };

      // Mockear el método verifyAsync para devolver un payload válido
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);

      const result = await authGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual(mockPayload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('validToken', {
        secret: process.env.JWT_SEED,
      });
    });

    it('should throw UnauthorizedException if token is missing', async () => {
      const mockRequest = {
        headers: {},
      } as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalidToken',
        },
      } as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Mockear el método verifyAsync para lanzar un error
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error());

      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token type is not Bearer', async () => {
      const mockRequest = {
        headers: {
          authorization: 'InvalidType invalidToken',
        },
      } as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('extractToken', () => {
    it('should extract token from Bearer header', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer validToken',
        },
      } as Request;

      const token = authGuard['extractToken'](mockRequest);

      expect(token).toBe('validToken');
    });

    it('should return undefined if authorization header is missing', () => {
      const mockRequest = {
        headers: {},
      } as Request;

      const token = authGuard['extractToken'](mockRequest);

      expect(token).toBeUndefined();
    });

    it('should return undefined if token type is not Bearer', () => {
      const mockRequest = {
        headers: {
          authorization: 'InvalidType invalidToken',
        },
      } as Request;

      const token = authGuard['extractToken'](mockRequest);

      expect(token).toBeUndefined();
    });
  });
});
