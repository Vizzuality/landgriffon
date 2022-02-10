import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum MATERIALS_ORDER_BY_VALUES {
  COUNTRY = 'country',
  BUSINESS_UNIT = 'businessUnit',
  PRODUCER = 'producer',
  T1SUPPLIER = 't1Supplier',
  MATERIAL = 'material',
  LOCATION_TYPE = 'locationType',
}

export class GetSourcingMaterialsQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  materialsData?: boolean;

  @ApiProperty({ required: false, enum: MATERIALS_ORDER_BY_VALUES })
  @IsOptional()
  @IsEnum(MATERIALS_ORDER_BY_VALUES, {
    message: `Available columns for orderBy: ${Object.values(
      MATERIALS_ORDER_BY_VALUES,
    ).join(', ')}`,
  })
  orderBy?: MATERIALS_ORDER_BY_VALUES;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
