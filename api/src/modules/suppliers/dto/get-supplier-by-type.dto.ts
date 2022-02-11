import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { SUPPLIER_TYPES } from 'modules/suppliers/supplier.entity';

export class GetSupplierByType {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(SUPPLIER_TYPES, {
    message: `Allowed Supplier types: ${Object.values(SUPPLIER_TYPES).join(
      ', ',
    )}`,
  })
  type!: SUPPLIER_TYPES;
}
