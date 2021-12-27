import { IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ScopeQueryDto extends PaginationQueryDto {
  @IsOptional()
  isArchived: string;
}
