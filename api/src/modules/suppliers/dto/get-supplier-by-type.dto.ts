import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { SUPPLIER_TYPES } from 'modules/suppliers/supplier.entity';
import { Type } from 'class-transformer';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';

export class GetSupplierByType {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(SUPPLIER_TYPES, {
    message: `Allowed Supplier types: ${Object.values(SUPPLIER_TYPES).join(
      ', ',
    )}`,
  })
  type!: SUPPLIER_TYPES;

  // Below fields for smart filtering
  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  materialIds?: string[];

  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  businessUnitIds?: string[];

  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  originIds?: string[];

  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  t1SupplierIds?: string[];

  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  producerIds?: string[];

  @ApiPropertyOptional({
    description: 'Types of Sourcing Locations, written with hyphens',
    enum: Object.values(LOCATION_TYPES),
    name: 'locationTypes[]',
  })
  @IsOptional()
  @IsEnum(LOCATION_TYPES, {
    each: true,
    message:
      'Available options: ' +
      Object.values(LOCATION_TYPES).toString().toLowerCase(),
  })
  @Type(() => String)
  locationTypes?: LOCATION_TYPES[];

  @ApiPropertyOptional({
    description: 'Array of Scenario Ids to include in the supplier search',
    name: 'scenarioIds[]',
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  scenarioIds?: string[];

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
