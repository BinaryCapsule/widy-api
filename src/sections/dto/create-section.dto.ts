import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  readonly title: string;

  @IsBoolean()
  @IsOptional()
  readonly isTomorrow?: boolean;
}
