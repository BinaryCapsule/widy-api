import { IsString, IsOptional } from "class-validator";

export class CreateScopeDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly shortCode: string;

  @IsOptional()
  readonly isArchived: boolean;
}
