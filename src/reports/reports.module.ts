import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { Day } from '../days/enities/day.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Day])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
