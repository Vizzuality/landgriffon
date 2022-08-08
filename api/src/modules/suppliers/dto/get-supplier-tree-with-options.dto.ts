/**
 * Get Supplier with options:
 */
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  LOCATION_TYPES,
  LOCATION_TYPES_PARAMS,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { transformLocationType } from 'utils/transform-location-type.util';

export class GetSupplierTreeWithOptions {
  @ApiPropertyOptional({
    description:
      'Return Suppliers with related Sourcing Locations. Setting this to true will override depth param',
  })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  withSourcingLocations?: boolean;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  depth?: number;

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
  supplierIds?: string[];

  @ApiPropertyOptional({
    description: 'Types of Sourcing Locations, written with hyphens',
    enum: Object.values(LOCATION_TYPES_PARAMS),
    name: 'locationTypes[]',
  })
  @IsOptional()
  @IsEnum(LOCATION_TYPES, {
    each: true,
    message:
      'Available options: ' +
      Object.values(LOCATION_TYPES_PARAMS).toString().toLowerCase(),
  })
  @Transform(({ value }: { value: LOCATION_TYPES_PARAMS[] }) =>
    transformLocationType(value),
  )
  @Type(() => String)
  locationTypes?: LOCATION_TYPES_PARAMS[];

  @IsUUID('4')
  @ApiPropertyOptional()
  @IsOptional()
  scenarioId?: string;
}
