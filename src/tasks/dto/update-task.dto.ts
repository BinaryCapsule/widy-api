import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsBoolean()
  @IsOptional()
  readonly isDone?: boolean;

  @IsOptional()
  readonly start?: string;

  @IsBoolean()
  @IsOptional()
  readonly isSchedule?: boolean;

  @IsNumber()
  @IsOptional()
  readonly time?: number;

  @IsString()
  @IsOptional()
  readonly notes?: string;
}
