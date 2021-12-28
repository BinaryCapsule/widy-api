import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDayReport(dayId: number, userId: string) {
    const day = await this.prisma.day.findFirst({
      where: {
        id: dayId,
        owner: userId,
      },

      include: {
        sections: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!day) {
      throw new NotFoundException(`Day #${dayId} not found`);
    }

    const sectionIds = day.sections.map(({ id }) => ({ sectionId: id }));

    const tasks = await this.prisma.task.findMany({
      where: {
        OR: sectionIds,
      },
    });

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
