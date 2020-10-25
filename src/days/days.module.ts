import { Module } from '@nestjs/common';
import { DaysController } from './days.controller';
import { DaysService } from './days.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from 'src/sections/entities/section.entity';
import { Task } from '../tasks/entities/task.entity';
import { Day } from './enities/day.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Day, Section, Task])],
  controllers: [DaysController],
  providers: [DaysService],
})
export class DaysModule {}
