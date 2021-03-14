import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/User';

@UseGuards(AuthGuard('jwt'))
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get(':id')
  findOne(@Param('id') id: number, @GetUser() user: User) {
    return this.sectionsService.findOne(id, user.sub);
  }
}
