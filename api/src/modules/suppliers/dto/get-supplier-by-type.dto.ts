/**
 * Get Supplier with options:
 */
import { IsBoolean, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SUPPLIER_TYPES } from 'modules/suppliers/supplier.entity';
import { Type } from 'class-transformer';

export class GetSupplierTreeWithOptions {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(SUPPLIER_TYPES, {
    message: `Available Supplier types: ${Object.keys(SUPPLIER_TYPES)
      .join(', ')
      .toLowerCase()}`,
  })
  type?: SUPPLIER_TYPES;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  withSourcingLocations?: boolean;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  depth?: number;
}
