import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BusinessUnitsSheetValidator {
  @IsNotEmpty({ message: 'Business Unit path_id must not be empty' })
  @IsString()
  path_id: string;

  @IsNotEmpty({ message: 'Supplier Name must not be empty' })
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}
