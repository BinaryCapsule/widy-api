import { SectionVariant } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  readonly title: string;

  @IsEnum(SectionVariant)
  @IsOptional()
  readonly variant?: SectionVariant;
}
