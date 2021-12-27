import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Scope } from '../scopes/entities/scope.entity';
import { Section } from '../sections/entities/section.entity';
import { SectionsService } from '../sections/sections.service';
import { DaysService } from '../days/days.service';
import { Day } from 'src/days/enities/day.entity';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Scope, Section, Day])],
  controllers: [TasksController],
  providers: [TasksService, SectionsService, DaysService, PrismaService],
})
export class TasksModule {}
