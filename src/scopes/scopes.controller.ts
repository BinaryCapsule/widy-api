import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ScopesService } from './scopes.service';
import { CreateScopeDto } from './dto/create-scope.dto';
import { UpdateScopeDto } from './dto/update-scope.dto';
import { ScopeQueryDto } from "./dto/scope-query.dto";

@Controller('scopes')
export class ScopesController {
  constructor(private readonly scopesService: ScopesService) {}

  @Get()
  findAll(@Query() scopeQueryDto: ScopeQueryDto) {
    return this.scopesService.findAll(scopeQueryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.scopesService.findOne(id);
  }

  @Post()
  create(@Body() createScopeDto: CreateScopeDto) {
    return this.scopesService.create(createScopeDto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateScopeDto: UpdateScopeDto) {
    return this.scopesService.update(id, updateScopeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.scopesService.remove(id);
  }
}
