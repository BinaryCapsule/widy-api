import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SectionVariant } from '../types/section-variant';

export class CreateSectionDto {
  @IsString()
  readonly title: string;

  @IsEnum(SectionVariant)
  @IsOptional()
  readonly variant?: SectionVariant;
}
