import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { replaceStringWhiteSpacesWithDash } from 'utils/transform-location-type.util';
import { ValidSortingYearValidator } from 'modules/impact/validation/valid-sorting-year.validator';

export enum ORDER_BY {
  DESC = 'DESC',
  ASC = 'ASC',
}

export type AnyImpactTableDto =
  | GetImpactTableDto
  | GetRankedImpactTableDto
  | GetActualVsScenarioImpactTableDto
  | GetScenarioVsScenarioImpactTableDto;

export enum GROUP_BY_VALUES {
  MATERIAL = 'material',
  BUSINESS_UNIT = 'business-unit',
  REGION = 'region',
  T1_SUPPLIER = 't1Supplier',
  PRODUCER = 'producer',
  LOCATION_TYPE = 'location-type',
}

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
    message: 'Available options: ' + Object.values(GROUP_BY_VALUES).toString(),
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
  t1SupplierIds?: string[];

  @ApiPropertyOptional({ name: 'supplierIds[]' })
  @IsOptional()
  @IsUUID(4, { each: true })
  @Type(() => String)
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
  @Transform(({ value }: { value: LOCATION_TYPES[] }) =>
    replaceStringWhiteSpacesWithDash(value),
  )
  @Type(() => String)
  locationTypes?: LOCATION_TYPES[];
}

export class GetImpactTableDto extends BaseImpactTableDto {
  @ApiPropertyOptional({
    description:
      'Include in the response elements that are being intervened in a Scenario,',
  })
  @IsOptional()
  @IsUUID(4)
  scenarioId?: string;

  @ApiPropertyOptional({
    description:
      'Sort all the entities recursively by the impact value corresponding to the sortingYear',
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Validate(ValidSortingYearValidator)
  sortingYear?: number;

  @ApiPropertyOptional({
    description: 'Indicates the order by which the entities will be sorted',
  })
  @IsOptional()
  @IsEnum(ORDER_BY)
  sortingOrder?: ORDER_BY;

  // Property for internal api use (entity filters)
  @IsOptional()
  scenarioIds?: string[];
}

export class GetActualVsScenarioImpactTableDto extends BaseImpactTableDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID(4)
  comparedScenarioId: string;

  @ApiPropertyOptional({
    description:
      'Sort all the entities recursively by the absolute difference value corresponding to the sortingYear',
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Validate(ValidSortingYearValidator)
  sortingYear?: number;

  @ApiPropertyOptional({
    description: 'Indicates the order by which the entities will be sorted',
  })
  @IsOptional()
  @IsEnum(ORDER_BY)
  sortingOrder?: ORDER_BY;

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

  @ApiPropertyOptional({
    description:
      'Sort all the entities recursively by the absolute difference value corresponding to the sortingYear',
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Validate(ValidSortingYearValidator)
  sortingYear?: number;

  @ApiPropertyOptional({
    description: 'Indicates the order by which the entities will be sorted',
  })
  @IsOptional()
  @IsEnum(ORDER_BY)
  sortingOrder?: ORDER_BY;

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
