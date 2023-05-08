import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  Supplier,
  SUPPLIER_STATUS,
  SUPPLIER_TYPES,
} from 'modules/suppliers/supplier.entity';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty({ message: 'Supplier Name must not be empty' })
  @MinLength(1, { message: 'Supplier Name is too short' })
  @MaxLength(400, { message: 'Supplier Name is too long' })
  @ApiProperty()
  name!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({
    enum: SUPPLIER_TYPES,
    description: `Type of the supplier. Available options: Tier 1 Supplier, Producer. Defaults to Tier 1 Supplier`,
  })
  @IsOptional()
  type?: SUPPLIER_TYPES;

  @IsString()
  @IsOptional()
  @IsEnum(SUPPLIER_STATUS)
  @ApiPropertyOptional()
  status?: string;

  @IsString()
  @IsOptional()
  @IsJSON()
  @ApiPropertyOptional()
  metadata?: string;

  @IsString()
  @IsOptional()
  mpath?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  parentId?: string;

  @IsOptional()
  parent?: Supplier;
}
