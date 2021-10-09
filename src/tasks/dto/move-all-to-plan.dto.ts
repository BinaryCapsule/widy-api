import { IsNumber } from 'class-validator';

export class MoveAllToPlanDto {
  @IsNumber()
  readonly dayId: number;
}
