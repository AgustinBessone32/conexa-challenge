import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MoviesModule } from './movies/movies.module';
@Module({
  imports: [AuthModule, UsersModule, MoviesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
