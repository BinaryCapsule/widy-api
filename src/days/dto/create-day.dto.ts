import { IsString } from 'class-validator';

export class CreateDayDto {
  @IsString()
  readonly day: string;
}
