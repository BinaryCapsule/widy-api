import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scope } from '../scopes/entities/scope.entity';
import { SectionsService } from '../sections/sections.service';
import { Section } from '../sections/entities/section.entity';
import { DaysService } from '../days/days.service';
import { Day } from '../days/enities/day.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { PAGINATION_LIMIT } from '../common/constants';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

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

  async findAll(paginationQuery: PaginationQueryDto, userId: string) {
    const { page = 1, limit = PAGINATION_LIMIT } = paginationQuery;

    const safeLimit = limit > PAGINATION_LIMIT ? PAGINATION_LIMIT : limit;

    return paginate<Task>(
      this.taskRepository,
      { limit: safeLimit, page },
      {
        where: { owner: userId },
        order: { id: 'DESC' },
      },
    );
  }

  async findOne(id: number) {
    const task = await this.taskRepository.findOne(id);

    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }

    return task;
  }

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const scope = createTaskDto.scopeId ? await this.preloadScope(createTaskDto.scopeId) : null;

    const task = await this.taskRepository.create(
      scope ? { ...createTaskDto, scope, owner: userId } : { ...createTaskDto, owner: userId },
    );

    const day = await this.daysService.findOne(createTaskDto.dayId, userId);

    const section = day.sections.find(({ id }) => id === createTaskDto.sectionId);

    if (!section) {
      throw new NotFoundException(`Section #${createTaskDto.sectionId} not found`);
    }

    section.tasks.push(task);

    await this.dayRepository.save(day);

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.taskRepository.preload({
      id,
      ...updateTaskDto,
    });

    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }

    return this.taskRepository.save(task);
  }

  async remove(id: number) {
    const task = await this.findOne(id);

    return this.taskRepository.remove(task);
  }

  private async preloadScope(id: number): Promise<Scope> {
    const existingScope = await this.scopeRepository.findOne(id);

    if (!existingScope) {
      throw new NotFoundException(`Scope with id ${id} not found`);
    }

    return existingScope;
  }
}
