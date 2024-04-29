import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class SheetValidatorSupplier {
  @IsString()
  @MinLength(1, { message: 'Supplier Name is too short' })
  @IsNotEmpty({ message: 'Supplier Name must not be empty' })
  path_id: string;

  @IsNotEmpty({ message: 'Supplier Name must not be empty' })
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}
