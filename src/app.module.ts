import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScopesModule } from './scopes/scopes.module';
import { SectionsModule } from './sections/sections.module';
import { DaysModule } from './days/days.module';
import { AuthModule } from './auth/auth.module';

const sslObj =
  process.env.NODE_ENV === 'production'
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {};

@Module({
  imports: [
    TasksModule,
    ScopesModule,
    SectionsModule,
    DaysModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.TYPEORM_SYNC === 'true',
      migrations: ['dist/migrations/*.js'],
      cli: {
        migrationsDir: 'src/migrations',
      },
      ...sslObj,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
