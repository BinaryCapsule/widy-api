import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/User';
import { CreateSectionDto } from './dto/create-section.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get('/tomorrow')
  findTomorrowSection(@GetUser() user: User) {
    return this.sectionsService.findTomorrowSection(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @GetUser() user: User) {
    return this.sectionsService.findOne(id, user.sub);
  }

  @Post()
  create(@Body() createSectionDto: CreateSectionDto, @GetUser() user: User) {
    return this.sectionsService.create(createSectionDto, user.sub);
  }
}
