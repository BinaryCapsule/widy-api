import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  readonly summary: string;

  @IsNumber()
  readonly dayId: number;

  @IsNumber()
  readonly sectionId: number;

  @IsNumber()
  readonly rank: number;

  @IsNumber()
  @IsOptional()
  readonly scopeId?: number;
}
