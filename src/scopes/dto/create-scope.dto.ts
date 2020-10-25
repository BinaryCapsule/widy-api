import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateScopeDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly shortCode: string;

  @IsBoolean()
  @IsOptional()
  readonly isArchived: boolean;
}
