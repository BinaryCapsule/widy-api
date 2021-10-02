import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
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

  async create(createSectionDto: CreateSectionDto, userId: string) {
    await this.validateSection(createSectionDto, userId);

    const section = this.sectionRepository.create({ ...createSectionDto, owner: userId });

    return this.sectionRepository.save(section);
  }

  async findTomorrowSection(userId: string) {
    const tomorrowSection = await this.sectionRepository.findOne({
      where: { isTomorrow: true, owner: userId },
    });

    if (!tomorrowSection) {
      const section: CreateSectionDto & { owner: string } = {
        isTomorrow: true,
        owner: userId,
        title: 'Tomorrow',
      };

      const newSection = await this.create(section, userId);

      return { ...newSection, tasks: [] };
    }

    return tomorrowSection;
  }

  private async validateSection(createSectionDto: CreateSectionDto, userId: string) {
    if (createSectionDto.isTomorrow) {
      const existingTomorrowSection = await this.sectionRepository.findOne({
        where: { isTomorrow: true, owner: userId },
      });

      if (existingTomorrowSection) {
        throw new ConflictException('Tomorrow section already exists');
      }
    }
  }
}
