import { IsEnum, IsOptional, IsPositive } from 'class-validator';

export class ScopeQueryDto {
  @IsOptional()
  @IsPositive()
  limit: number;

  @IsOptional()
  @IsPositive()
  offset: number;

  @IsOptional()
  @IsEnum([0, 1])
  isArchived: number;
}
