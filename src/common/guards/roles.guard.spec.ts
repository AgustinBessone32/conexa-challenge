import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if user role matches allowed roles', () => {
      const mockRequest = {
        user: {
          role: 'admin',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      // Mockear el método getAllAndOverride para devolver el rol permitido
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue('admin');

      const result = rolesGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        expect.any(String),
        [mockContext.getHandler(), mockContext.getClass()],
      );
    });

    it('should throw ForbiddenException if user role does not match allowed roles', () => {
      const mockRequest = {
        user: {
          role: 'user',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      // Mockear el método getAllAndOverride para devolver un rol diferente
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue('admin');

      expect(() => rolesGuard.canActivate(mockContext)).toThrow(
        ForbiddenException,
      );
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        expect.any(String),
        [mockContext.getHandler(), mockContext.getClass()],
      );
    });

    it('should throw ForbiddenException if user role is not defined', () => {
      const mockRequest = {
        user: {},
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      // Mockear el método getAllAndOverride para devolver un rol permitido
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue('admin');

      expect(() => rolesGuard.canActivate(mockContext)).toThrow(
        ForbiddenException,
      );
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        expect.any(String),
        [mockContext.getHandler(), mockContext.getClass()],
      );
    });
  });
});
