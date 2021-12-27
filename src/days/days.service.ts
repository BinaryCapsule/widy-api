import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateDayDto } from './dto/create-day.dto';
import { PAGINATION_LIMIT, RANK_BLOCK_SIZE } from '../common/constants';
import { SectionVariant } from '../sections/types/section-variant';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DaysService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(paginationQuery: PaginationQueryDto, userId: string) {
    const { page = 1, limit = PAGINATION_LIMIT } = paginationQuery;

    const safeLimit = limit > PAGINATION_LIMIT ? PAGINATION_LIMIT : limit;

    const days = await this.prisma.day.findMany({
      skip: (page - 1) * safeLimit,
      take: safeLimit,

      where: {
        owner: userId,
      },

      orderBy: {
        day: 'desc',
      },

      select: {
        id: true,
        day: true,
      },
    });

    const totalItems = await this.prisma.day.count({
      where: {
        owner: userId,
      },
    });

    const itemCount = days.length;

    return {
      items: days,
      meta: {
        totalItems,
        itemCount,
        itemsPerPage: safeLimit,
        totalPages: Math.ceil(totalItems / safeLimit),
        currentPage: page,
      },
    };
  }

  async findOne(id: number, userId: string) {
    const day = await this.prisma.day.findFirst({
      where: {
        id,
        owner: userId,
      },

      include: {
        sections: {
          orderBy: {
            rank: 'asc',
          },

          include: {
            tasks: {
              orderBy: {
                rank: 'asc',
              },
            },
          },
        },
      },
    });

    if (!day) {
      throw new NotFoundException(`Day #${id} not found`);
    }

    return day;
  }

  async create(createDayDto: CreateDayDto, userId: string) {
    const existingDay = await this.prisma.day.findFirst({
      where: {
        day: createDayDto.day,
        owner: userId,
      },
    });

    if (existingDay) {
      throw new ConflictException('Day already exists');
    }

    const sections = [
      { variant: SectionVariant.Plan, title: 'Plan', rank: RANK_BLOCK_SIZE, owner: userId },
      {
        variant: SectionVariant.Work,
        title: 'In the morning',
        rank: RANK_BLOCK_SIZE * 2,
        owner: userId,
      },
      {
        variant: SectionVariant.Work,
        title: 'In the afternoon',
        rank: RANK_BLOCK_SIZE * 3,
        owner: userId,
      },
    ];

    return this.prisma.day.create({
      data: {
        ...createDayDto,
        owner: userId,

        sections: {
          create: sections,
        },
      },
    });
  }
}
