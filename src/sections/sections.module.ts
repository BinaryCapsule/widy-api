import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { Section } from './entities/section.entity';
import { Day } from '../days/enities/day.entity';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';
import { DaysService } from '../days/days.service';

@Module({
  imports: [TypeOrmModule.forFeature([Section, Day, Task])],
  controllers: [SectionsController],
  providers: [SectionsService, DaysService],
})
export class SectionsModule {}
