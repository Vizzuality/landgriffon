import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SUPPLIER_TYPES } from 'modules/suppliers/supplier.entity';

export class GetSupplierByType {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(SUPPLIER_TYPES, {
    message: `Available Supplier types: ${Object.keys(SUPPLIER_TYPES)
      .join(', ')
      .toLowerCase()}`,
  })
  type?: SUPPLIER_TYPES;
}
