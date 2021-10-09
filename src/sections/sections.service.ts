import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { SectionVariant } from './types/section-variant';
import { DaysService } from '../days/days.service';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,

    private readonly daysService: DaysService,
  ) {}

  async findOne(id: number, userId: string) {
    const section = await this.sectionRepository.findOne({
      where: {
        id,
        owner: userId,
      },
    });

    if (!section) {
      throw new NotFoundException(`Section with id #${id} not found`);
    }

    return section;
  }

  async create(createSectionDto: CreateSectionDto, userId: string): Promise<Section> {
    await this.validateSection(createSectionDto, userId);

    const section = this.sectionRepository.create({ ...createSectionDto, owner: userId });

    const savedSection = await this.sectionRepository.save(section);

    return { ...savedSection, tasks: [] };
  }

  async findTomorrowSection(userId: string): Promise<Section> {
    const query = this.sectionRepository.createQueryBuilder('section');

    query.leftJoinAndSelect('section.tasks', 'tasks');
    query.where('section.owner = :userId', { userId });
    query.andWhere('section.variant = :variant', { variant: 'tomorrow' });
    query.orderBy({ 'tasks.rank': 'ASC' });

    const tomorrowSection = await query.getOne();

    if (!tomorrowSection) {
      const section: CreateSectionDto & { owner: string } = {
        title: 'Tomorrow',
        variant: SectionVariant.Tomorrow,
        owner: userId,
      };

      const newSection = await this.create(section, userId);

      return { ...newSection, tasks: [] };
    }

    return tomorrowSection;
  }

  async findPlanSection(dayId: number, userId: string) {
    const day = await this.daysService.findOne(dayId, userId);

    const planSection = day.sections.find(({ variant }) => variant === 'plan');

    if (!planSection) {
      throw new NotFoundException(`Plan section not found for day with id #${dayId}`);
    }

    return planSection;
  }

  private async validateSection(createSectionDto: CreateSectionDto, userId: string) {
    if (createSectionDto.variant === SectionVariant.Tomorrow) {
      const existingTomorrowSection = await this.sectionRepository.findOne({
        where: { variant: SectionVariant.Tomorrow, owner: userId },
      });

      if (existingTomorrowSection) {
        throw new ConflictException('Tomorrow section already exists');
      }
    }
  }
}
