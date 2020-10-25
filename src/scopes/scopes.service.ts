import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, Repository } from 'typeorm';
import { CreateScopeDto } from './dto/create-scope.dto';
import { UpdateScopeDto } from './dto/update-scope.dto';
import { Scope } from './entities/scope.entity';
import { ScopeQueryDto } from './dto/scope-query.dto';

@Injectable()
export class ScopesService {
  constructor(
    @InjectRepository(Scope)
    private readonly scopesRepository: Repository<Scope>,
  ) {}

  findAll(scopeQueryDto: ScopeQueryDto) {
    const { limit, offset, isArchived } = scopeQueryDto;

    return this.scopesRepository.find({
      take: limit,
      skip: offset,
      where: {
        isArchived:
          isArchived !== undefined ? Boolean(isArchived) : Any([true, false]),
      },
    });
  }

  async findOne(id: number) {
    const scope = await this.scopesRepository.findOne(id);

    if (!scope) {
      throw new NotFoundException(`Scope #${id} not found`);
    }

    return scope;
  }

  create(createScopeDto: CreateScopeDto) {
    const scope = this.scopesRepository.create(createScopeDto);

    return this.scopesRepository.save(scope);
  }

  async update(id: number, updateScopeDto: UpdateScopeDto) {
    const scope = await this.scopesRepository.preload({
      id,
      ...updateScopeDto,
    });

    if (!scope) {
      throw new NotFoundException(`Scope #${id} not found`);
    }

    return this.scopesRepository.save(scope);
  }

  async remove(id: number) {
    const scope = await this.findOne(id);

    return this.scopesRepository.remove(scope);
  }
}
