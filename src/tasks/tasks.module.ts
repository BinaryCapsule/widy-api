import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SectionsModule } from '../sections/sections.module';
import { DaysModule } from '../days/days.module';

@Module({
  imports: [PrismaModule, SectionsModule, DaysModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
