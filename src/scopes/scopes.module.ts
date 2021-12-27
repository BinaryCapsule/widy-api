import { Module } from '@nestjs/common';
import { ScopesController } from './scopes.controller';
import { ScopesService } from './scopes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scope } from './entities/scope.entity';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [TypeOrmModule.forFeature([Scope])],
  controllers: [ScopesController],
  providers: [ScopesService, PrismaService],
})
export class ScopesModule {}
