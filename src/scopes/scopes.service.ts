import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScopeDto } from './dto/create-scope.dto';
import { UpdateScopeDto } from './dto/update-scope.dto';
import { Scope } from './entities/scope.entity';
import { ScopeQueryDto } from './dto/scope-query.dto';
import { paginate } from 'nestjs-typeorm-paginate';
import { PAGINATION_LIMIT } from 'src/common/constants';
import { queryBoolFilter } from '../common/helpers/queryBoolFilter';

@Injectable()
export class ScopesService {
  constructor(
    @InjectRepository(Scope)
    private readonly scopesRepository: Repository<Scope>,
  ) {}

  findAll(scopeQueryDto: ScopeQueryDto, userId: string) {
    const { page = 1, limit = PAGINATION_LIMIT, isArchived } = scopeQueryDto;

    const safeLimit = limit > PAGINATION_LIMIT ? PAGINATION_LIMIT : limit;

    return paginate<Scope>(
      this.scopesRepository,
      { limit: safeLimit, page },
      {
        where: {
          owner: userId,
          isArchived: queryBoolFilter(isArchived),
        },
        order: { id: 'DESC' },
      },
    );
  }

  async findOne(id: number, userId: string) {
    const scope = await this.scopesRepository.findOne({
      where: {
        id,
        owner: userId,
      },
    });

    if (!scope) {
      throw new NotFoundException(`Scope #${id} not found`);
    }

    return scope;
  }

  async create(createScopeDto: CreateScopeDto, userId: string) {
    await this.validateScopeCode(createScopeDto.shortCode, userId);

    const scope = this.scopesRepository.create({ ...createScopeDto, owner: userId });

    return this.scopesRepository.save(scope);
  }

  async update(id: number, updateScopeDto: UpdateScopeDto, userId: string) {
    if (updateScopeDto.shortCode) {
      await this.validateScopeCode(updateScopeDto.shortCode, userId);
    }

    const scope = await this.scopesRepository.preload({
      id,
      ...updateScopeDto,
    });

    if (!scope) {
      throw new NotFoundException(`Scope #${id} not found`);
    }

    return this.scopesRepository.save(scope);
  }

  async remove(id: number, userId: string) {
    const scope = await this.findOne(id, userId);

    return this.scopesRepository.remove(scope);
  }

  private async validateScopeCode(shortCode: string, userId: string) {
    const existingScopeWithCode = await this.scopesRepository.findOne({
      where: { shortCode, owner: userId },
    });

    if (existingScopeWithCode) {
      throw new ConflictException('Scope code already exists');
    }
  }
}
