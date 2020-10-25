import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) {}

  async findOne(id: number) {
    const section = await this.sectionRepository.findOne(id);

    if (!section) {
      throw new NotFoundException(`Section with id #${id} not found`);
    }

    return section;
  }
}
