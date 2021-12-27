import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { IsOptional } from 'class-validator';

export class TaskQueryDto extends PaginationQueryDto {
  @IsOptional()
  isDone: string;
}
