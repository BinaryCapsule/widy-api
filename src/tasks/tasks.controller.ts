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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { User } from '../auth/User';

@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto, @GetUser() user: User) {
    return this.tasksService.findAll(paginationQuery, user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @GetUser() user: User) {
    return this.tasksService.findOne(id, user.sub);
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @GetUser() user) {
    return this.tasksService.create(createTaskDto, user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateTaskDto: UpdateTaskDto, @GetUser() user: User) {
    return this.tasksService.update(id, updateTaskDto, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @GetUser() user: User) {
    return this.tasksService.remove(id, user.sub);
  }
}
