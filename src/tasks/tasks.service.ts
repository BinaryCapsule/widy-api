import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import moment from 'moment';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Scope } from '../scopes/entities/scope.entity';
import { SectionsService } from '../sections/sections.service';
import { Section } from '../sections/entities/section.entity';
import { DaysService } from '../days/days.service';
import { Day } from '../days/enities/day.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { PAGINATION_LIMIT } from '../common/constants';
import { TaskQueryDto } from './dto/task-query.dto';
import { queryBoolFilter } from '../common/helpers/queryBoolFilter';

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
    const scope = createTaskDto.scopeId ? await this.preloadScope(createTaskDto.scopeId) : null;

    const task = await this.taskRepository.create({ ...createTaskDto, scope, owner: userId });

    const day = await this.daysService.findOne(createTaskDto.dayId, userId);

    const section = day.sections.find(({ id }) => id === createTaskDto.sectionId);

    if (!section) {
      throw new NotFoundException(`Section #${createTaskDto.sectionId} not found`);
    }

    section.tasks.push(task);

    await this.dayRepository.save(day);

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

    if (updateTaskDto.scopeId !== undefined) {
      if (updateTaskDto.scopeId) {
        task.scope = await this.preloadScope(updateTaskDto.scopeId);
      } else {
        task.scope = null;
      }
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

  private async preloadScope(id: number): Promise<Scope> {
    const existingScope = await this.scopeRepository.findOne(id);

    if (!existingScope) {
      throw new NotFoundException(`Scope with id ${id} not found`);
    }

    return existingScope;
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
