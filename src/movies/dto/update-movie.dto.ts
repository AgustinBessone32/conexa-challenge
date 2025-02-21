import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateMovieDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  readonly opening_crawl: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  readonly director: string;

  @IsNumber()
  @IsOptional()
  readonly episode_id?: number;

  @IsString()
  @IsOptional()
  readonly created?: string;

  @IsString()
  @IsOptional()
  readonly edited?: string;

  @IsString()
  @IsOptional()
  readonly url?: string;

  @IsString()
  @IsOptional()
  readonly producer?: string;

  @IsString()
  @IsOptional()
  readonly release_date?: string;

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  @IsString({ each: true })
  characters?: string[];

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  @IsString({ each: true })
  planets?: string[];

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  @IsString({ each: true })
  starships?: string[];

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  @IsString({ each: true })
  vehicles?: string[];

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  @IsString({ each: true })
  species?: string[];
}
