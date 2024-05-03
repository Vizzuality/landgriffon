import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class SupplierSheetValidator {
  @IsString()
  @IsNotEmpty({ message: 'Supplier path_id must not be empty' })
  path_id: string;

  @IsNotEmpty({ message: 'Supplier Name must not be empty' })
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}