import { Module } from '@nestjs/common';
import { ScopesController } from './scopes.controller';
import { ScopesService } from './scopes.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScopesController],
  providers: [ScopesService],
})
export class ScopesModule {}
