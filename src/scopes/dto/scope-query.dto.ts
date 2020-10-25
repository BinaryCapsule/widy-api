import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ScopeQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum([0, 1])
  isArchived: number;
}
