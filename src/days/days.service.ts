import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Day } from './enities/day.entity';
import { CreateDayDto } from './dto/create-day.dto';
import { Section } from '../sections/entities/section.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { BLOCK_SIZE, PAGINATION_LIMIT } from '../common/constants';

@Injectable()
export class DaysService {
  constructor(
    @InjectRepository(Day)
    private dayRepository: Repository<Day>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async findAll(paginationQuery: PaginationQueryDto, user: string): Promise<Pagination<Day>> {
    const { page = 1, limit = PAGINATION_LIMIT } = paginationQuery;

    const safeLimit = limit > PAGINATION_LIMIT ? PAGINATION_LIMIT : limit;

    return paginate<Day>(
      this.dayRepository,
      { limit: safeLimit, page },
      {
        where: { owner: user },
        loadEagerRelations: false,
        select: ['id', 'day'],
        order: { day: 'DESC' },
      },
    );
  }

  async findOne(id: number, userId: string) {
    const query = this.dayRepository.createQueryBuilder('day');

    query.leftJoinAndSelect('day.sections', 'sections');
    query.leftJoinAndSelect('sections.tasks', 'tasks');
    query.leftJoinAndSelect('tasks.scope', 'scope');
    query.where('day.owner = :userId', { userId });
    query.andWhere('day.id = :id', { id });
    query.orderBy({
      'sections.rank': 'ASC',
      'tasks.rank': 'ASC',
    });

    const day = await query.getOne();

    if (!day) {
      throw new NotFoundException(`Day #${id} not found`);
    }

    return day;
  }

  async create(createDayDto: CreateDayDto, userId: string) {
    const existingDay = await this.dayRepository.findOne({
      where: { day: createDayDto.day },
    });

    if (existingDay) {
      throw new ConflictException('Day already exists');
    }

    const sectionData = [
      { isPlan: true, title: 'Plan', rank: BLOCK_SIZE },
      { isPlan: false, title: 'In the afternoon', rank: BLOCK_SIZE * 3 },
      { isPlan: false, title: 'In the morning', rank: BLOCK_SIZE * 2 },
    ];

    const sections = await Promise.all(
      sectionData.map(async section => {
        const s = await this.sectionRepository.create({
          ...section,
          owner: userId,
        });
        return this.sectionRepository.save(s);
      }),
    );

    const day = await this.dayRepository.create({
      ...createDayDto,
      owner: userId,
      sections,
    });

    return this.dayRepository.save(day);
  }
}
