import { Module } from '@nestjs/common';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';
import { DaysService } from '../days/days.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SectionsController],
  providers: [SectionsService, DaysService, PrismaService],
})
export class SectionsModule {}
