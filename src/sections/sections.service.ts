import { SectionVariant } from '@prisma/client';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { RANK_BLOCK_SIZE } from '../common/constants';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: number, userId: string) {
    const section = await this.prisma.section.findUnique({
      where: {
        id,
      },

      include: {
        tasks: true,
      },
    });

    if (!section || section.owner !== userId) {
      throw new NotFoundException(`Section with id #${id} not found`);
    }

    return section;
  }

  async create(createSectionDto: CreateSectionDto, userId: string) {
    await this.validateSection(createSectionDto, userId);

    return this.prisma.section.create({
      data: {
        ...createSectionDto,
        owner: userId,
      },

      include: {
        tasks: true,
      },
    });
  }

  async findTomorrowSection(userId: string) {
    const tomorrowSection = await this.prisma.section.findFirst({
      where: {
        owner: userId,
        variant: SectionVariant.tomorrow,
      },

      include: {
        tasks: true,
      },

      orderBy: {
        rank: 'asc',
      },
    });

    if (!tomorrowSection) {
      const section: CreateSectionDto & { owner: string } = {
        title: 'Tomorrow',
        variant: SectionVariant.tomorrow,
        owner: userId,
      };

      return this.create(section, userId);
    }

    return tomorrowSection;
  }

  async findPlanSection(dayId: number, userId: string) {
    const planSection = await this.prisma.section.findFirst({
      where: {
        dayId,
        owner: userId,
        variant: SectionVariant.plan,
      },
    });

    if (!planSection) {
      throw new NotFoundException(`Plan section not found for day with id #${dayId}`);
    }

    return planSection;
  }

  async redistributeRanks(sectionId: number, userId: string) {
    const section = await this.findOne(sectionId, userId);

    const sortedTasks = section.tasks.sort((a, b) => a.rank - b.rank);

    await this.prisma.$transaction(
      sortedTasks.map(({ id }, index) =>
        this.prisma.task.update({
          data: { rank: (index + 1) * RANK_BLOCK_SIZE },
          where: { id },
        }),
      ),
    );
  }

  private async validateSection(createSectionDto: CreateSectionDto, userId: string) {
    if (createSectionDto.variant === SectionVariant.tomorrow) {
      const existingTomorrowSection = await this.prisma.section.findFirst({
        where: {
          variant: SectionVariant.tomorrow,
          owner: userId,
        },
      });

      if (existingTomorrowSection) {
        throw new ConflictException('Tomorrow section already exists');
      }
    }
  }
}
