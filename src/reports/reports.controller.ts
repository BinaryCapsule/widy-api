import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/User';

@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':dayId')
  async getDayReport(@Param('dayId') dayId: number, @GetUser() user: User) {
    return this.reportsService.getDayReport(dayId, user.sub);
  }
}
