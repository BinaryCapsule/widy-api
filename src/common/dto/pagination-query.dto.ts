import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  limit: number;

  @IsOptional()
  page: number;
}
