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
import { TaskQueryDto } from './dto/task-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/User';
import { MoveToPlanDto } from './dto/move-to-plan.dto';
import { MoveAllToPlanDto } from './dto/move-all-to-plan.dto';
import { MoveAllToTomorrowDto } from './dto/move-all-to-tomorrow.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Query() taskQueryDto: TaskQueryDto, @GetUser() user: User) {
    return this.tasksService.findAll(taskQueryDto, user.sub);
  }

  @Get('/active')
  async findActive(@GetUser() user: User) {
    const task = await this.tasksService.findActive(user.sub);

    return { id: task ? task.id : null };
  }

  @Patch('/to-plan')
  async moveAllToPlan(@Body() moveAllToPlanDto: MoveAllToPlanDto, @GetUser() user: User) {
    return this.tasksService.moveAllToPlan(moveAllToPlanDto, user.sub);
  }

  @Patch('/to-tomorrow')
  async moveAllToTomorrow(
    @Body() moveAllToTomorrowDto: MoveAllToTomorrowDto,
    @GetUser() user: User,
  ) {
    return this.tasksService.moveAllToTomorrow(moveAllToTomorrowDto, user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @GetUser() user: User) {
    return this.tasksService.findOne(id, user.sub);
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @GetUser() user) {
    return this.tasksService.create(createTaskDto, user.sub);
  }

  @Patch('/:id/to-tomorrow')
  moveToTomorrow(@Param('id') id: number, @GetUser() user: User) {
    return this.tasksService.moveToTomorrow(id, user.sub);
  }

  @Patch('/:id/to-plan')
  moveToPlan(@Param('id') id: number, @Body() moveToPlanDto: MoveToPlanDto, @GetUser() user: User) {
    return this.tasksService.moveToPlan(id, moveToPlanDto, user.sub);
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
