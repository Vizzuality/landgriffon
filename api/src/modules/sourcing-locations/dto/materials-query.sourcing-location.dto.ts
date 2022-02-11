import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum MATERIALS_ORDER_BY_VALUES {
  COUNTRY = 'country',
  BUSINESS_UNIT = 'businessUnit',
  PRODUCER = 'producer',
  T1SUPPLIER = 't1Supplier',
  MATERIAL = 'material',
  LOCATION_TYPE = 'locationType',
}

export enum ORDER_BY_OPTIONS {
  DESC = 'desc',
  ASC = 'asc',
}

export class GetSourcingMaterialsQueryDto {
  @ApiPropertyOptional({ enum: MATERIALS_ORDER_BY_VALUES })
  @IsOptional()
  @IsEnum(MATERIALS_ORDER_BY_VALUES, {
    message: `Available columns for orderBy: ${Object.values(
      MATERIALS_ORDER_BY_VALUES,
    ).join(', ')}`,
  })
  orderBy?: MATERIALS_ORDER_BY_VALUES;

  @ApiPropertyOptional({ enum: ORDER_BY_OPTIONS })
  @IsOptional()
  @IsEnum(ORDER_BY_OPTIONS, {
    message: `Available columns for order: ${Object.values(
      ORDER_BY_OPTIONS,
    ).join(', ')}`,
  })
  order?: ORDER_BY_OPTIONS;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
