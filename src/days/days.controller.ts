import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateDayDto } from './dto/create-day.dto';
import { DaysService } from './days.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('days')
export class DaysController {
  constructor(private readonly daysService: DaysService) {}

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto, @GetUser() user) {
    return this.daysService.findAll(paginationQuery, user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @GetUser() user) {
    return this.daysService.findOne(id, user.sub);
  }

  @Post()
  create(@Body() createDayDto: CreateDayDto, @GetUser() user) {
    return this.daysService.create(createDayDto, user.sub);
  }
}
