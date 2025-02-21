import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Role } from '@prisma/client';
import { Auth } from '../common/decorators/auth.decorator';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

describe('MoviesController', () => {
  let controller: MoviesController;
  let service: MoviesService;

  const mockMoviesService = {
    create: jest.fn().mockImplementation((dto) => dto as CreateMovieDto),
    findAll: jest.fn().mockResolvedValue([{ id: 1, title: 'Movie 1' }]),
    findOne: jest.fn().mockImplementation((id) => ({ id, title: 'Movie 1' })),
    update: jest
      .fn()
      .mockImplementation((id, dto) => ({ id, ...(dto as UpdateMovieDto) })),
    remove: jest.fn().mockImplementation((id) => ({ id })),
    seed: jest.fn().mockResolvedValue('Seed completed'),
  };

  const mockReflector = {
    get: jest.fn().mockImplementation((metadataKey, target) => {
      if (
        target === MoviesController.prototype.findAll ||
        target === MoviesController.prototype.findOne
      ) {
        return [Role.USER];
      }
      if (
        target === MoviesController.prototype.create ||
        target === MoviesController.prototype.update ||
        target === MoviesController.prototype.remove
      ) {
        return [Role.ADMIN];
      }
      return [];
    }),
  };

  const mockJwtService = {
    verify: jest.fn().mockImplementation((token) => {
      if (token === 'valid-token-user') {
        return { role: Role.USER };
      }
      if (token === 'valid-token-admin') {
        return { role: Role.ADMIN };
      }
      throw new Error('Invalid token');
    }),
  };

  const mockAuthGuard = {
    canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) {
        return false;
      }
      try {
        const user = mockJwtService.verify(token);
        request.user = user;
        const roles = mockReflector.get('roles', context.getHandler());
        return roles.includes(user.role);
      } catch {
        return false;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    })
      .overrideGuard(Auth) // Sobrescribir el guardia @Auth
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<MoviesController>(MoviesController);
    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should allow USER role to access', async () => {
      const mockContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer valid-token-user',
            },
          }),
        }),
        getHandler: () => MoviesController.prototype.findAll,
        getClass: () => MoviesController,
      } as unknown as ExecutionContext;

      const canActivate = mockAuthGuard.canActivate(mockContext);

      expect(canActivate).toBe(true);

      const result = await controller.findAll();
      expect(result).toEqual([{ id: 1, title: 'Movie 1' }]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should not allow ADMIN role to access', () => {
      const mockContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer valid-token-admin',
            },
          }),
        }),
        getHandler: () => MoviesController.prototype.findAll,
        getClass: () => MoviesController,
      } as unknown as ExecutionContext;

      const canActivate = mockAuthGuard.canActivate(mockContext);

      expect(canActivate).toBe(false);
    });
  });

  describe('findOne', () => {
    it('should allow USER role to access', async () => {
      const mockContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer valid-token-user',
            },
          }),
        }),
        getHandler: () => MoviesController.prototype.findOne,
        getClass: () => MoviesController,
      } as unknown as ExecutionContext;

      const canActivate = mockAuthGuard.canActivate(mockContext);

      expect(canActivate).toBe(true);

      const result = await controller.findOne(1);
      expect(result).toEqual({ id: 1, title: 'Movie 1' });
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should not allow ADMIN role to access', () => {
      const mockContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer valid-token-admin',
            },
          }),
        }),
        getHandler: () => MoviesController.prototype.findOne(1),
        getClass: () => MoviesController,
      } as unknown as ExecutionContext;

      const canActivate = mockAuthGuard.canActivate(mockContext);

      expect(canActivate).toBe(false);
    });
  });

  describe('create', () => {
    it('should allow ADMIN role to access', async () => {
      // Mockear el contexto con un usuario con rol ADMIN
      const mockContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer valid-token-admin', // Token válido para ADMIN
            },
          }),
        }),
        getHandler: () => MoviesController.prototype.create,
        getClass: () => MoviesController,
      } as unknown as ExecutionContext;

      // Simular el guardia
      const canActivate = mockAuthGuard.canActivate(mockContext);

      expect(canActivate).toBe(true);

      const createMovieDto: CreateMovieDto = {
        title: 'New Movie',
        director: 'A Besso',
        opening_crawl: 'desc',
      };
      const result = await controller.create(createMovieDto);

      expect(result).toEqual(createMovieDto);
      expect(service.create).toHaveBeenCalledWith(createMovieDto);
    });

    it('should not allow USER role to access', async () => {
      const mockContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer valid-token-user',
            },
          }),
        }),
        getHandler: () => MoviesController.prototype.create,
        getClass: () => MoviesController,
      } as unknown as ExecutionContext;

      const canActivate = mockAuthGuard.canActivate(mockContext);

      expect(canActivate).toBe(false);

      const createMovieDto: CreateMovieDto = {
        title: 'New Movie',
        director: 'A Besso',
        opening_crawl: 'desc',
      };
      try {
        await controller.create(createMovieDto);
      } catch (e) {
        expect(e.message).toBe('Forbidden');
      }
    });
  });

  describe('update', () => {
    it('should allow ADMIN role to access', async () => {
      const mockContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer valid-token-admin',
            },
          }),
        }),
        getHandler: () => MoviesController.prototype.update,
        getClass: () => MoviesController,
      } as unknown as ExecutionContext;

      const canActivate = mockAuthGuard.canActivate(mockContext);

      expect(canActivate).toBe(true);

      const updateMovieDto = { title: 'Updated Movie' } as UpdateMovieDto;
      const movieId = 1;
      const result = await controller.update(movieId, updateMovieDto);

      expect(result).toEqual({ id: movieId, ...updateMovieDto });
      expect(service.update).toHaveBeenCalledWith(movieId, updateMovieDto);
    });

    it('should not allow USER role to access', async () => {
      const mockContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer valid-token-user',
            },
          }),
        }),
        getHandler: () => MoviesController.prototype.update,
        getClass: () => MoviesController,
      } as unknown as ExecutionContext;

      const canActivate = mockAuthGuard.canActivate(mockContext);

      expect(canActivate).toBe(false);

      const updateMovieDto = { title: 'Updated Movie' } as UpdateMovieDto;
      const movieId = 1;
      try {
        await controller.update(movieId, updateMovieDto);
      } catch (e) {
        expect(e.message).toBe('Forbidden');
      }
    });
  });

  describe('delete', () => {
    it('should allow ADMIN role to access', async () => {
      const mockContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer valid-token-admin',
            },
          }),
        }),
        getHandler: () => MoviesController.prototype.remove,
        getClass: () => MoviesController,
      } as unknown as ExecutionContext;

      const canActivate = mockAuthGuard.canActivate(mockContext);

      expect(canActivate).toBe(true);

      const movieId = 1;
      const result = await controller.remove(movieId);

      expect(result).toEqual({ id: movieId });
      expect(service.remove).toHaveBeenCalledWith(movieId);
    });

    it('should not allow USER role to access', async () => {
      const mockContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer valid-token-user',
            },
          }),
        }),
        getHandler: () => MoviesController.prototype.remove,
        getClass: () => MoviesController,
      } as unknown as ExecutionContext;

      const canActivate = mockAuthGuard.canActivate(mockContext);

      expect(canActivate).toBe(false);

      const movieId = 1;
      try {
        await controller.remove(movieId);
      } catch (e) {
        expect(e.message).toBe('Forbidden');
      }
    });
  });
});
