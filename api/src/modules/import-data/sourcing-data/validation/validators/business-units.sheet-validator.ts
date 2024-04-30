import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BusinessUnitsSheetValidator {
  @IsNotEmpty({ message: 'Business Unit path_id must not be empty' })
  @IsString({ message: 'Business Unit path_id must be a string' })
  path_id: string;

  @IsNotEmpty({ message: 'Business Unit Name must not be empty' })
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}
