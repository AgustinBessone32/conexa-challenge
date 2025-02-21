import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Role } from '@prisma/client';
import { Auth } from '../common/decorators/auth.decorator';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized Bearer Auth' })
@ApiForbiddenResponse({ description: 'Forbidden' })
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @Auth(Role.ADMIN)
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Get('seed')
  @Auth(Role.ADMIN)
  async seedMovies() {
    return await this.moviesService.seed();
  }

  @Get()
  @Auth(Role.USER)
  findAll() {
    return this.moviesService.findAll();
  }

  @Get(':id')
  @Auth(Role.USER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.remove(id);
  }
}
