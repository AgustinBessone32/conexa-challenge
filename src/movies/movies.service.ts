import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Movie } from '@prisma/client';

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createMovieDto: CreateMovieDto,
  ): Promise<{ message: string; data: Movie }> {
    try {
      const movie = await this.prisma.movie.create({
        data: {
          ...createMovieDto,
        },
      });
      return { message: 'Movie successfully created', data: movie };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new HttpException('Movie already exists', HttpStatus.CONFLICT);
      }

      throw new HttpException(
        'Failed to create movie',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<Movie[]> {
    try {
      const movies: Movie[] = await this.prisma.movie.findMany();

      if (movies.length === 0) {
        throw new HttpException(`Movies not found`, HttpStatus.NOT_FOUND);
      }
      return movies;
    } catch {
      throw new HttpException(
        `Movies not found`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<Movie> {
    const movie = await this.prisma.movie.findFirst({ where: { id } });

    if (!movie) {
      throw new HttpException(
        `Movie with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return movie;
  }

  async update(
    id: number,
    updateMovieDto: UpdateMovieDto,
  ): Promise<{ message: string; data: Movie }> {
    try {
      await this.findOne(id);

      const updatedMovie = await this.prisma.movie.update({
        where: { id },
        data: { ...updateMovieDto },
      });

      return { message: 'Movie successfully updated', data: updatedMovie };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to update movie',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

      await this.prisma.movie.delete({
        where: { id },
      });

      return { message: 'Movie successfully deleted' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to delete movie',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async seed() {
    try {
      const response = await fetch(process.env.API_URL as string);
      const data = await response.json();

      const movies = data.results as Movie[];

      for (const movie of movies) {
        await this.prisma.movie.create({
          data: movie,
        });
      }

      return { message: 'Movies saved successfully', count: movies.length };
    } catch (error) {
      throw new Error(`Failed to fetch and save movies: ${error.message}`);
    }
  }
}
