import { IsNumber } from 'class-validator';

export class MoveToPlanDto {
  @IsNumber()
  readonly dayId: number;
}
