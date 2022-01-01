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
            variant: true,
            title: true,
          },
        },
      },
    });

    if (!day) {
      throw new NotFoundException(`Day #${dayId} not found`);
    }

    const sectionIds = day.sections
      .filter(({ variant }) => variant !== 'plan')
      .map(({ id }) => ({ sectionId: id }));

    const tasks = await this.prisma.task.findMany({
      where: {
        OR: sectionIds,
      },

      include: {
        scope: {
          select: {
            name: true,
            shortCode: true,
          },
        },
      },
    });

    const totalTime = tasks.reduce((acc, { time }) => acc + time, 0);
    const completedTasks = tasks.filter(({ isDone }) => isDone).length;

    return {
      day: day.day,
      sections: day.sections,
      tasks,
      totalTime,
      completedTasks,
    };
  }
}
