import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import moment from 'moment';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, IsNull, Not, Repository } from 'typeorm';
import { Scope } from '../scopes/entities/scope.entity';
import { SectionsService } from '../sections/sections.service';
import { DaysService } from '../days/days.service';
import { Section } from '../sections/entities/section.entity';
import { Day } from '../days/enities/day.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { PAGINATION_LIMIT, RANK_BLOCK_SIZE } from '../common/constants';
import { TaskQueryDto } from './dto/task-query.dto';
import { queryBoolFilter } from '../common/helpers/queryBoolFilter';
import { MoveToPlanDto } from './dto/move-to-plan.dto';
import { MoveAllToPlanDto } from './dto/move-all-to-plan.dto';
import { MoveAllToTomorrowDto } from './dto/move-all-to-tomorrow.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Scope)
    private readonly scopeRepository: Repository<Scope>,

    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,

    @InjectRepository(Day)
    private readonly dayRepository: Repository<Day>,

    private readonly sectionsService: SectionsService,

    private readonly daysService: DaysService,
  ) {}

  async findAll(taskQueryDto: TaskQueryDto, userId: string) {
    const { page = 1, limit = PAGINATION_LIMIT, isDone } = taskQueryDto;

    const safeLimit = limit > PAGINATION_LIMIT ? PAGINATION_LIMIT : limit;

    return paginate<Task>(
      this.taskRepository,
      { limit: safeLimit, page },
      {
        where: {
          owner: userId,
          isDone: queryBoolFilter(isDone),
        },
        order: { id: 'DESC' },
      },
    );
  }

  async findOne(id: number, userId: string) {
    const task = await this.taskRepository.findOne({
      where: {
        id,
        owner: userId,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }

    return task;
  }

  async findActive(userId: string) {
    const task = await this.taskRepository.findOne({
      where: {
        owner: userId,
        start: Not(IsNull()),
      },
    });

    if (!task) {
      return null;
    }

    return task;
  }

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const task = await this.taskRepository.create({ ...createTaskDto, owner: userId });

    const section = await this.sectionsService.findOne(createTaskDto.sectionId, userId);

    if (!section) {
      throw new NotFoundException(`Section #${createTaskDto.sectionId} not found`);
    }

    section.tasks.push(task);

    await this.sectionRepository.save(section);

    delete task.owner;

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.taskRepository.preload({
      id,
      ...updateTaskDto,
      owner: userId,
    });

    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }

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

    return this.taskRepository.save(task);
  }

  async remove(id: number, userId: string) {
    const task = await this.findOne(id, userId);

    return this.taskRepository.remove(task);
  }

  async moveToTomorrow(id: number, userId: string) {
    const task = await this.taskRepository.findOne({
      id,
      owner: userId,
    });

    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }

    const tomorrowSection = await this.sectionsService.findTomorrowSection(userId);

    const { tasks } = tomorrowSection;

    task.sectionId = tomorrowSection.id;
    task.rank = RANK_BLOCK_SIZE + (tasks.length > 0 ? tasks[tasks.length - 1].rank : 0);
    task.time = 0;
    task.start = null;
    task.isDone = false;
    task.dayId = null;

    return this.taskRepository.save(task);
  }

  async moveToPlan(id: number, moveToPlanDto: MoveToPlanDto, userId: string) {
    const day = await this.daysService.findOne(moveToPlanDto.dayId, userId);
    const task = await this.findOne(id, userId);

    const planSection = day.sections.find(({ variant }) => variant === 'plan');
    const { tasks } = planSection;

    task.sectionId = planSection.id;
    task.isDone = false;
    task.time = 0;
    task.rank = RANK_BLOCK_SIZE + (tasks.length > 0 ? tasks[tasks.length - 1].rank : 0);
    task.dayId = moveToPlanDto.dayId;

    return this.taskRepository.save(task);
  }

  async moveAllToPlan({ dayId }: MoveAllToPlanDto, userId: string) {
    const [{ id: tomorrowSectionId }, { id: planSectionId }] = await Promise.all([
      this.sectionsService.findTomorrowSection(userId),
      this.sectionsService.findPlanSection(dayId, userId),
    ]);

    await getConnection()
      .createQueryBuilder()
      .update(Task)
      .set({ dayId, sectionId: planSectionId })
      .where('sectionId = :sectionId', { sectionId: tomorrowSectionId })
      .execute();

    return {};
  }

  async moveAllToTomorrow({ dayId }: MoveAllToTomorrowDto, userId: string) {
    const [{ id: tomorrowSectionId }, { id: planSectionId }] = await Promise.all([
      this.sectionsService.findTomorrowSection(userId),
      this.sectionsService.findPlanSection(dayId, userId),
    ]);

    await getConnection()
      .createQueryBuilder()
      .update(Task)
      .set({ dayId: null, sectionId: tomorrowSectionId, isDone: false, start: null, time: 0 })
      .where('sectionId = :sectionId', { sectionId: planSectionId })
      .execute();

    return {};
  }

  private async stopActiveTask(userId: string) {
    try {
      const task = await this.findActive(userId);

      if (!task) {
        return;
      }

      if (task.start) {
        const newTime = task.time + moment().diff(task.start, 'seconds');
        task.start = null;
        task.time = newTime;
      }

      return this.taskRepository.save(task);
    } catch {
      return;
    }
  }
}
