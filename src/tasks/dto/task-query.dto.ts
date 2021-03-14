import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { IsOptional } from 'class-validator';
import { IsQueryBool } from 'src/common/validators/IsQueryBool';

export class TaskQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsQueryBool()
  isDone: number;
}
