import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ScopesService } from './scopes.service';
import { CreateScopeDto } from './dto/create-scope.dto';
import { UpdateScopeDto } from './dto/update-scope.dto';
import { ScopeQueryDto } from './dto/scope-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/User';

@UseGuards(AuthGuard('jwt'))
@Controller('scopes')
export class ScopesController {
  constructor(private readonly scopesService: ScopesService) {}

  @Get()
  findAll(@Query() scopeQueryDto: ScopeQueryDto, @GetUser() user: User) {
    return this.scopesService.findAll(scopeQueryDto, user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @GetUser() user: User) {
    return this.scopesService.findOne(id, user.sub);
  }

  @Post()
  create(@Body() createScopeDto: CreateScopeDto, @GetUser() user: User) {
    return this.scopesService.create(createScopeDto, user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateScopeDto: UpdateScopeDto, @GetUser() user: User) {
    return this.scopesService.update(id, updateScopeDto, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @GetUser() user: User) {
    return this.scopesService.remove(id, user.sub);
  }
}
