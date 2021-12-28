import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { SectionsService } from '../sections/sections.service';
import { DaysService } from '../days/days.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, SectionsService, DaysService, PrismaService],
})
export class TasksModule {}
