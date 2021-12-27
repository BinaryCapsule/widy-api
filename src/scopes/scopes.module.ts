import { Module } from '@nestjs/common';
import { ScopesController } from './scopes.controller';
import { ScopesService } from './scopes.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ScopesController],
  providers: [ScopesService, PrismaService],
})
export class ScopesModule {}
