import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { Repository } from 'typeorm';
import { Day } from '../days/enities/day.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Day)
    private readonly dayRepository: Repository<Day>,
  ) {}

  async getDayReport(dayId: number, userId: string) {
    const day = await this.dayRepository.findOne({
      where: {
        id: dayId,
        owner: userId,
      },
    });

    if (!day) {
      throw new NotFoundException(`Day #${dayId} not found`);
    }

    const query = this.taskRepository.createQueryBuilder('task');

    query.leftJoinAndSelect('task.section', 'section');
    query.where('task.owner = :userId', { userId });
    query.andWhere('task.dayId = :dayId', { dayId });

    const tasks = await query.getMany();

    const totalTime = tasks.reduce((acc, { time }) => acc + time, 0);
    const completedTasks = tasks.filter(({ isDone }) => isDone).length;

    return {
      day: day.day,
      tasks,
      totalTime,
      completedTasks,
    };
  }
}
