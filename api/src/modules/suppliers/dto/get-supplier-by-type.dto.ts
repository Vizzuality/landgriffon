import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { SUPPLIER_TYPES } from 'modules/suppliers/supplier.entity';
import { Type } from 'class-transformer';
import {
  CommonEUDRFiltersDTO,
  CommonFiltersDto,
} from 'utils/base.query-builder';

export class GetSupplierByType extends CommonFiltersDto {
  @ApiProperty({
    enum: Object.values(SUPPLIER_TYPES),
  })
  @IsNotEmpty()
  @IsEnum(SUPPLIER_TYPES, {
    message: `Allowed Supplier types: ${Object.values(SUPPLIER_TYPES).join(
      ', ',
    )}`,
  })
  type?: SUPPLIER_TYPES;

  @ApiProperty({
    description: `The sort order by Name for the resulting entities. Can be 'ASC' (Ascendant) or 'DESC' (Descendent). Defaults to ASC`,
  })
  @Type(() => String)
  @IsString()
  @IsOptional()
  @IsIn(['ASC', 'DESC'], {
    message: `sort property must be either 'ASC' (Ascendant) or 'DESC' (Descendent)`,
  })
  sort?: 'ASC' | 'DESC';
}

export class GetSupplierEUDR extends CommonEUDRFiltersDTO {
  @IsOptional()
  type: SUPPLIER_TYPES = SUPPLIER_TYPES.PRODUCER;
}
