import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

describe('MoviesService', () => {
  let service: MoviesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    movie: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  global.fetch = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of movies', async () => {
      const mockMovies = [
        { id: 1, title: 'Movie 1', director: 'A Besso', opening_crawl: 'desc' },
        { id: 2, title: 'Movie 2', director: 'A Besso', opening_crawl: 'desc' },
      ];

      mockPrismaService.movie.findMany.mockResolvedValue(mockMovies);

      const result = await service.findAll();

      expect(result).toEqual(mockMovies);
      expect(prisma.movie.findMany).toHaveBeenCalled();
    });

    it('should throw a not found exception if no movies are found', async () => {
      mockPrismaService.movie.findMany.mockResolvedValue([]);

      await expect(service.findAll()).rejects.toThrow(
        new HttpException('Movies not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an internal server error if fetching fails', async () => {
      mockPrismaService.movie.findMany.mockRejectedValue(new Error('DB Error'));

      await expect(service.findAll()).rejects.toThrow(
        new HttpException('Movies not found', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('findOne', () => {
    it('should return a movie by ID', async () => {
      const mockMovie = { id: 1, title: 'Movie 1', director: 'test' };

      mockPrismaService.movie.findFirst.mockResolvedValue(mockMovie);

      const result = await service.findOne(1);

      expect(result).toEqual(mockMovie);
      expect(prisma.movie.findFirst).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw a not found exception if movie does not exist', async () => {
      mockPrismaService.movie.findFirst.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(
        new HttpException('Movie with ID 1 not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('create', () => {
    it('should return a new Movie', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'Movie 1',
        director: 'A Besso',
        opening_crawl: 'desc',
      };

      mockPrismaService.movie.create.mockResolvedValue(createMovieDto);

      const result = await service.create(createMovieDto);

      expect(result).toEqual({
        data: createMovieDto,
        message: 'Movie successfully created',
      });
      expect(prisma.movie.create).toHaveBeenCalledWith({
        data: { ...createMovieDto },
      });
    });

    it('should throw a conflict exception if movie already exists', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'New Movie',
        director: 'A Besso',
        opening_crawl: 'test',
      };

      mockPrismaService.movie.create.mockRejectedValue({
        code: 'P2002',
      });

      await expect(service.create(createMovieDto)).rejects.toThrow(
        new HttpException('Movie already exists', HttpStatus.CONFLICT),
      );
    });

    it('should throw an internal server error if creation fails', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'New Movie',
        director: 'A Besso',
        opening_crawl: 'test',
      };

      mockPrismaService.movie.create.mockRejectedValue(new Error('DB Error'));

      await expect(service.create(createMovieDto)).rejects.toThrow(
        new HttpException(
          'Failed to create movie',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('update', () => {
    it('should update a movie successfully', async () => {
      const mockMovie = { id: 1, title: 'Updated Movie', year: 2023 };
      const updateMovieDto = { title: 'Updated Movie' } as UpdateMovieDto;

      mockPrismaService.movie.findFirst.mockResolvedValue(mockMovie);
      mockPrismaService.movie.update.mockResolvedValue(mockMovie);

      const result = await service.update(1, updateMovieDto);

      expect(result).toEqual({
        message: 'Movie successfully updated',
        data: mockMovie,
      });
      expect(prisma.movie.findFirst).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateMovieDto,
      });
    });

    it('should throw a not found exception if movie does not exist', async () => {
      mockPrismaService.movie.findFirst.mockResolvedValue(null);
      const updateMovieDto = { title: 'Updated Movie' } as UpdateMovieDto;
      await expect(service.update(1, updateMovieDto)).rejects.toThrow(
        new HttpException('Movie with ID 1 not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an internal server error if update fails', async () => {
      const mockMovie = { id: 1, title: 'Movie 1', director: 'A Besso' };
      const updateMovieDto = { title: 'Updated Movie' } as UpdateMovieDto;

      mockPrismaService.movie.findFirst.mockResolvedValue(mockMovie);
      mockPrismaService.movie.update.mockRejectedValue(new Error('DB Error'));

      await expect(service.update(1, updateMovieDto)).rejects.toThrow(
        new HttpException(
          'Failed to update movie',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('delete', () => {
    it('should delete a movie successfully', async () => {
      const mockMovie = { id: 1, title: 'Movie 1', director: 'A Besso' };

      mockPrismaService.movie.findFirst.mockResolvedValue(mockMovie);
      mockPrismaService.movie.delete.mockResolvedValue(mockMovie);

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Movie successfully deleted' });
      expect(prisma.movie.findFirst).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.movie.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw a not found exception if movie does not exist', async () => {
      mockPrismaService.movie.findFirst.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(
        new HttpException('Movie with ID 1 not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an internal server error if deletion fails', async () => {
      const mockMovie = { id: 1, title: 'Movie 1', director: 'A Besso' };

      mockPrismaService.movie.findFirst.mockResolvedValue(mockMovie);
      mockPrismaService.movie.delete.mockRejectedValue(new Error('DB Error'));

      await expect(service.remove(1)).rejects.toThrow(
        new HttpException(
          'Failed to delete movie',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('seed', () => {
    it('should seed movies successfully', async () => {
      const mockMovies = [
        { title: 'Movie 1', director: 'A Besso' },
        { title: 'Movie 2', director: 'A Besso' },
        { title: 'Movie 3', director: 'A Besso' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ results: mockMovies }),
      });

      mockPrismaService.movie.create.mockResolvedValue({});

      const result = await service.seed();

      expect(result).toEqual({
        message: 'Movies saved successfully',
        count: mockMovies.length,
      });
      expect(global.fetch).toHaveBeenCalledWith(process.env.API_URL);

      expect(prisma.movie.create).toHaveBeenCalledTimes(
        mockPrismaService.movie.create.mock.calls.length,
      );
    });

    it('should throw an error if fetching movies fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      await expect(service.seed()).rejects.toThrow(
        new Error('Failed to fetch and save movies: API Error'),
      );
    });

    it('should throw an error if saving movies fails', async () => {
      const mockMovies = [
        { title: 'Movie 1', director: 'A Besso' },
        { title: 'Movie 2', director: 'A Besso' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ results: mockMovies }),
      });

      mockPrismaService.movie.create.mockRejectedValue(new Error('DB Error'));

      await expect(service.seed()).rejects.toThrow(
        new Error('Failed to fetch and save movies: DB Error'),
      );
    });
  });
});
