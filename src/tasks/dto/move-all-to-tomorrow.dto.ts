import { IsNumber } from 'class-validator';

export class MoveAllToTomorrowDto {
  @IsNumber()
  readonly dayId: number;
}
