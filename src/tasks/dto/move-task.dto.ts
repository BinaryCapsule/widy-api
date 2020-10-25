import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class MoveTaskDto {
  @IsNumber()
  @IsPositive()
  readonly fromSectionId: number;

  @IsNumber()
  @IsPositive()
  readonly toSectionId: number;
}
