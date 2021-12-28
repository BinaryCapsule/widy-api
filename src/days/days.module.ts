import { Module } from '@nestjs/common';
import { DaysController } from './days.controller';
import { DaysService } from './days.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DaysController],
  providers: [DaysService, PrismaService],
})
export class DaysModule {}
