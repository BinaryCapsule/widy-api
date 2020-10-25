import { Controller, Get, Param } from '@nestjs/common';
import { SectionsService } from './sections.service';

@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.sectionsService.findOne(id);
  }
}
