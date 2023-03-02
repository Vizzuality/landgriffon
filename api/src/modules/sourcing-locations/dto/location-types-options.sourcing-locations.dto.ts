import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { Type } from 'class-transformer';

export class GetLocationTypesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  supplierIds?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  businessUnitIds?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional()
  @IsOptional()
  originIds?: string[];

  @IsArray()
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

  @IsUUID('4')
  @ApiPropertyOptional()
  @IsOptional()
  scenarioId?: string;

  @ApiPropertyOptional({
    description: 'Array of Scenario Ids to include in the location type search',
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  scenarioIds?: string[];

  @ApiPropertyOptional({
    description:
      'Get all supported location types. Setting this to true overrides all other parameters',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  supported?: boolean;

  @ApiPropertyOptional({
    description: 'Sorting parameter to order the result. Defaults to ASC ',
    enum: ['ASC', 'DESC'],
  })
  @Type(() => String)
  @IsString()
  @IsOptional()
  @IsIn(['ASC', 'DESC'], {
    message: `sort property must be either 'ASC' (Ascendant) or 'DESC' (Descendent)`,
  })
  sort?: 'ASC' | 'DESC';
}
