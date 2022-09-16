import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { AvailableResolutions } from 'modules/h3-data/dto/get-material-h3-by-resolution.dto';
import {
  LOCATION_TYPES,
  LOCATION_TYPES_PARAMS,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { transformLocationType } from 'utils/transform-location-type.util';

export enum GROUP_BY_VALUES {
  MATERIAL = 'material',
  BUSINESS_UNIT = 'business-unit',
  REGION = 'region',
  SUPPLIER = 'supplier',
  LOCATION_TYPE = 'location-type',
}

export class GetImpactMapDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  indicatorId: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  year!: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(6)
  @IsEnum(AvailableResolutions, { message: 'Available resolutions: 1 to 6' })
  resolution!: number;

  @ApiPropertyOptional({ name: 'materialIds[]' })
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  materialIds?: string[];

  @ApiPropertyOptional({ name: 'originIds[]' })
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  originIds?: string[];

  @ApiPropertyOptional({ name: 'supplierIds[]' })
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
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

  @ApiPropertyOptional({
    name: 'scenarioId',
    description:
      'The scenarioID, whose information will be included in the response. That is, ' +
      'the impact of all indicator records related to the interventions of that scenarioId, ' +
      'will be aggregated into the response map data, along the actual data.',
  })
  @IsOptional()
  @IsUUID()
  scenarioId?: string;
}
