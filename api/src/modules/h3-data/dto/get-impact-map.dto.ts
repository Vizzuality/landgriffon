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

class BaseGetImpactMapDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  indicatorId!: string;

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
}

export class GetImpactMapDto extends BaseGetImpactMapDto {
  @ApiPropertyOptional({
    name: 'scenarioId',
    description:
      'The scenarioID, whose information will be included in the response. That is, ' +
      'the impact of all indicator records related to the interventions of that scenarioId, ' +
      'will be aggregated into the response map data along the actual data.',
  })
  @IsOptional()
  @IsUUID()
  scenarioId?: string;
}

export class GetActualVsScenarioImpactMapDto extends BaseGetImpactMapDto {
  @ApiProperty({
    name: 'comparedScenarioId',
    description:
      'The id of the scenario against which the actual data will be compared to.',
  })
  @IsUUID()
  @IsNotEmpty()
  comparedScenarioId!: string;

  @ApiProperty({
    name: 'relative',
    description:
      'Indicates whether the result will be absolute difference values (false) or relative values in percentages (true)',
  })
  //@IsBoolean()
  //@Type(() => Boolean)
  // TODO this is a provisional workaround since class-transformer has issues with boolean values
  // Might be worth doing a ToBoolean decorator if the use is more frequent
  //https://stackoverflow.com/questions/59046629/boolean-parameter-in-request-body-is-always-true-in-nestjs-api
  @Transform(({ value }: { value: any }) => {
    return [true, 'enabled', 'true', 1, '1'].indexOf(value) > -1;
  })
  @IsNotEmpty()
  relative!: boolean;
}

export class GetScenarioVsScenarioImpactMapDto extends BaseGetImpactMapDto {
  @ApiProperty({
    name: 'baseScenarioId',
    description:
      'The of the scenario that will be the base for the comparison.',
  })
  @IsUUID()
  @IsNotEmpty()
  baseScenarioId!: string;

  @ApiProperty({
    name: 'comparedScenarioId',
    description:
      'The id of the scenario against which the base Scenario will be compared to.',
  })
  @IsUUID()
  @IsNotEmpty()
  comparedScenarioId!: string;

  @ApiProperty({
    name: 'relative',
    description:
      'Indicates whether the result will be absolute difference values (false) or relative values in percentages (true)',
  })
  // TODO see GetActualVsScenarioImpactMapDto
  @Transform(({ value }: { value: any }) => {
    return [true, 'enabled', 'true', 1, '1'].indexOf(value) > -1;
  })
  @IsNotEmpty()
  relative!: boolean;
}
