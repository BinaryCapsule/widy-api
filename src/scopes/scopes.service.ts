import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateScopeDto } from './dto/create-scope.dto';
import { UpdateScopeDto } from './dto/update-scope.dto';
import { ScopeQueryDto } from './dto/scope-query.dto';
import { PAGINATION_LIMIT } from 'src/common/constants';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ScopesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(scopeQueryDto: ScopeQueryDto, userId: string) {
    const { page = 1, limit = PAGINATION_LIMIT, isArchived } = scopeQueryDto;

    const safeLimit = limit > PAGINATION_LIMIT ? PAGINATION_LIMIT : limit;

    return this.prisma.scope.findMany({
      skip: (page - 1) * safeLimit,
      take: safeLimit,

      where: {
        owner: userId,
        isArchived: isArchived !== undefined ? isArchived === 'true' : undefined,
      },

      orderBy: {
        id: 'desc',
      },
    });
  }

  async findOne(id: number, userId: string) {
    const scope = await this.prisma.scope.findUnique({
      where: {
        id,
      },
    });

    if (!scope || scope.owner !== userId) {
      throw new NotFoundException(`Scope #${id} not found`);
    }

    return scope;
  }

  async create(createScopeDto: CreateScopeDto, userId: string) {
    await this.validateScopeCode(createScopeDto.shortCode, userId);

    return this.prisma.scope.create({
      data: {
        ...createScopeDto,
        owner: userId,
      },
    });
  }

  async update(id: number, updateScopeDto: UpdateScopeDto, userId: string) {
    // Check if scope exists
    await this.findOne(id, userId);

    // ShortCode must be unique
    if (updateScopeDto.shortCode) {
      await this.validateScopeCode(updateScopeDto.shortCode, userId);
    }

    return this.prisma.scope.update({
      data: updateScopeDto,

      where: {
        id,
      },
    });
  }

  async remove(id: number, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.scope.delete({
      where: {
        id,
      },
    });
  }

  private async validateScopeCode(shortCode: string, userId: string) {
    const existingScopeWithCode = await this.prisma.scope.findFirst({
      where: {
        shortCode,
        owner: userId,
      },
    });

    if (existingScopeWithCode) {
      throw new ConflictException('Scope code already exists');
    }
  }
}
