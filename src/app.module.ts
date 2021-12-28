import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { ScopesModule } from './scopes/scopes.module';
import { SectionsModule } from './sections/sections.module';
import { DaysModule } from './days/days.module';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [TasksModule, ScopesModule, SectionsModule, DaysModule, AuthModule, ReportsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
