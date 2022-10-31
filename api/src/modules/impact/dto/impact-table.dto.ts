import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

import { GROUP_BY_VALUES } from 'modules/h3-data/dto/get-impact-map.dto';
import {
  LOCATION_TYPES,
  LOCATION_TYPES_PARAMS,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { transformLocationType } from 'utils/transform-location-type.util';

export class BaseImpactTableDto {
  @ApiProperty({
    name: 'indicatorIds[]',
  })
  @IsUUID(4, { each: true })
  @Type(() => String)
  indicatorIds!: string[];

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  startYear!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  endYear!: number;

  @ApiProperty({
    enum: Object.values(GROUP_BY_VALUES),
  })
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  @IsEnum(GROUP_BY_VALUES, {
    message:
      'Available options: ' +
      Object.values(GROUP_BY_VALUES).toString().toLowerCase(),
  })
  groupBy!: string;

  @ApiPropertyOptional({ name: 'materialIds[]' })
  @IsOptional()
  @IsUUID(4, { each: true })
  @Type(() => String)
  materialIds?: string[];

  @ApiPropertyOptional({ name: 'originIds[]' })
  @IsOptional()
  @IsUUID(4, { each: true })
  @Type(() => String)
  originIds?: string[];

  @ApiPropertyOptional({ name: 'supplierIds[]' })
  @IsOptional()
  @IsUUID(4, { each: true })
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
}

export class GetActualVsScenarioImpactTableDto extends BaseImpactTableDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID(4)
  comparedScenarioId: string;

  // Property for internal api use (entity filters)
  @IsOptional()
  scenarioIds?: string[];
}

export class GetImpactTableDto extends BaseImpactTableDto {
  @ApiPropertyOptional({
    description:
      'Include in the response elements that are being intervened in a Scenario,',
  })
  @IsOptional()
  @IsUUID(4)
  scenarioId?: string;

  // Property for internal api use (entity filters)
  @IsOptional()
  scenarioIds?: string[];
}
export class GetScenarioVsScenarioImpactTableDto extends BaseImpactTableDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID(4)
  baseScenarioId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID(4)
  comparedScenarioId: string;

  // Property for internal api use (entity filters)
  @IsOptional()
  scenarioIds?: string[];
}

export class GetRankedImpactTableDto extends BaseImpactTableDto {
  @ApiProperty({
    description:
      'The maximum number of entities to show in the Impact Table. If the result includes more than that, they will be' +
      'aggregated into the "other" field in the response',
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  maxRankingEntities: number;

  @ApiProperty({
    description: `The sort order for the resulting entities. Can be 'ASC' (Ascendant) or 'DES' (Descendent), with the default being 'DES'`,
  })
  @Type(() => String)
  @IsString()
  @IsOptional()
  @IsIn(['ASC', 'DES'], {
    message: `sort property must be either 'ASC' (Ascendant) or 'DES' (Descendent)`,
  })
  sort?: string;

  @ApiPropertyOptional({
    description:
      'Include in the response elements that are being intervened in a Scenario,',
  })
  @IsOptional()
  @IsUUID(4)
  scenarioId?: string;

  // Property for internal api use (entity filters)
  @IsOptional()
  scenarioIds?: string[];
}
