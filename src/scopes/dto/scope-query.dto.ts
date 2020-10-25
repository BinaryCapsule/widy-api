import { IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { IsQueryBool } from '../../common/validators/IsQueryBool';

export class ScopeQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsQueryBool()
  isArchived: number;
}
