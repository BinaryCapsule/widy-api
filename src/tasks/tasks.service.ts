import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import moment from 'moment';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SectionsService } from '../sections/sections.service';
import { DaysService } from '../days/days.service';
import { PAGINATION_LIMIT, RANK_BLOCK_SIZE } from '../common/constants';
import { TaskQueryDto } from './dto/task-query.dto';
import { MoveToPlanDto } from './dto/move-to-plan.dto';
import { MoveAllToPlanDto } from './dto/move-all-to-plan.dto';
import { MoveAllToTomorrowDto } from './dto/move-all-to-tomorrow.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly sectionsService: SectionsService,

    private readonly daysService: DaysService,

    private readonly prisma: PrismaService,
  ) {}

  async findAll(taskQueryDto: TaskQueryDto, userId: string) {
    const { page = 1, limit = PAGINATION_LIMIT, isDone } = taskQueryDto;

    const safeLimit = limit > PAGINATION_LIMIT ? PAGINATION_LIMIT : limit;

    return this.prisma.task.findMany({
      skip: (page - 1) * safeLimit,
      take: safeLimit,

      where: {
        owner: userId,
        isDone: isDone !== undefined ? isDone === 'true' : undefined,
      },

      orderBy: {
        id: 'desc',
      },
    });
  }

  async findOne(id: number, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: {
        id,
      },
    });

    if (!task || task.owner !== userId) {
      throw new NotFoundException(`Task #${id} not found`);
    }

    return task;
  }

  async findActive(userId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        owner: userId,
        start: { not: null },
      },
    });

    if (!task) {
      return null;
    }

    return task;
  }

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const section = await this.sectionsService.findOne(createTaskDto.sectionId, userId);

    if (!section) {
      throw new NotFoundException(`Section #${createTaskDto.sectionId} not found`);
    }

    return this.prisma.task.create({
      data: {
        summary: createTaskDto.summary,
        rank: createTaskDto.rank,
        section: {
          connect: { id: createTaskDto.sectionId },
        },
        scope: createTaskDto.scopeId
          ? {
              connect: { id: createTaskDto.scopeId },
            }
          : undefined,
        owner: userId,
      },
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: string) {
    // Check if task exists
    await this.findOne(id, userId);

    // If we are starting a task (start !== null) stop the current active task
    if (updateTaskDto.start) {
      await this.stopActiveTask(userId);
    }

    // We are moving a task to a different section (sectionId !== null)
    if (updateTaskDto.sectionId) {
      if (!updateTaskDto.rank) {
        throw new BadRequestException('Need to provide a rank');
      }

      // Check if destination section exists
      await this.sectionsService.findOne(updateTaskDto.sectionId, userId);
    }

    return this.prisma.task.update({
      data: updateTaskDto,

      where: {
        id,
      },
    });
  }

  async remove(id: number, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.task.delete({ where: { id }, select: { id: true } });
  }

  async moveToTomorrow(id: number, userId: string) {
    await this.findOne(id, userId);

    const tomorrowSection = await this.sectionsService.findTomorrowSection(userId);

    const { tasks } = tomorrowSection;

    return this.prisma.task.update({
      where: { id },
      data: {
        sectionId: tomorrowSection.id,
        rank: RANK_BLOCK_SIZE + (tasks.length > 0 ? tasks[tasks.length - 1].rank : 0),
        time: 0,
        start: null,
        isDone: false,
      },
      select: { id: true },
    });
  }

  async moveToPlan(id: number, moveToPlanDto: MoveToPlanDto, userId: string) {
    await this.findOne(id, userId);

    const day = await this.daysService.findOne(moveToPlanDto.dayId, userId);

    const planSection = day.sections.find(({ variant }) => variant === 'plan');

    const { id: planSectionId, tasks } = planSection;

    return this.prisma.task.update({
      data: {
        isDone: false,
        time: 0,
        rank: RANK_BLOCK_SIZE + (tasks.length > 0 ? tasks[tasks.length - 1].rank : 0),
        section: {
          connect: { id: planSectionId },
        },
      },
      where: { id },
    });
  }

  async moveAllToPlan({ dayId }: MoveAllToPlanDto, userId: string) {
    const [{ id: tomorrowSectionId }, { id: planSectionId }] = await Promise.all([
      this.sectionsService.findTomorrowSection(userId),
      this.sectionsService.findPlanSection(dayId, userId),
    ]);

    await this.prisma.task.updateMany({
      data: {
        sectionId: planSectionId,
      },

      where: {
        owner: userId,
        sectionId: tomorrowSectionId,
      },
    });

    await this.sectionsService.redistributeRanks(planSectionId, userId);

    return {};
  }

  async moveAllToTomorrow({ dayId }: MoveAllToTomorrowDto, userId: string) {
    const [{ id: tomorrowSectionId }, { id: planSectionId }] = await Promise.all([
      this.sectionsService.findTomorrowSection(userId),
      this.sectionsService.findPlanSection(dayId, userId),
    ]);

    await this.prisma.task.updateMany({
      data: {
        sectionId: tomorrowSectionId,
      },

      where: {
        owner: userId,
        sectionId: planSectionId,
      },
    });

    await this.sectionsService.redistributeRanks(tomorrowSectionId, userId);

    return {};
  }

  private async stopActiveTask(userId: string) {
    try {
      const task = await this.findActive(userId);

      if (!task) {
        return;
      }

      const newTime = task.time + moment().diff(task.start, 'seconds');

      return this.prisma.task.update({
        where: { id: task.id },
        data: {
          start: null,
          time: newTime,
        },
      });
    } catch {
      return;
    }
  }
}
