import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScopesModule } from './scopes/scopes.module';
import { SectionsModule } from './sections/sections.module';
import { DaysModule } from './days/days.module';
import { AuthModule } from './auth/auth.module';
import connectionOptions from './ormconfig';

@Module({
  imports: [
    TasksModule,
    ScopesModule,
    SectionsModule,
    DaysModule,
    TypeOrmModule.forRoot(connectionOptions),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
