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
import { Type } from 'class-transformer';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';

export class GetMaterialTreeWithOptionsDto {
  @ApiPropertyOptional({
    description:
      'Return Materials with related Sourcing Locations. Setting this to true will override depth param',
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
  supplierIds?: string[];

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
  materialIds?: string[];

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  scenarioId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { each: true })
  scenarioIds?: string[];
}
