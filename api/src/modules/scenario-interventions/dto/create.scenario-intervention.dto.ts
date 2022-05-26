import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { SCENARIO_INTERVENTION_TYPE } from 'modules/scenario-interventions/scenario-intervention.entity';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { IndicatorCoefficientsDto } from 'modules/indicator-coefficients/dto/indicator-coefficients.dto';
import { Type } from 'class-transformer';

export class CreateScenarioInterventionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty({
    description: 'Title of the Intervention',
    type: String,
    example: 'Replace cotton',
  })
  title!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Brief description of the Intervention',
    type: String,
    example: 'This intervention will replace cotton for wool',
  })
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Object.values(SCENARIO_INTERVENTION_TYPE))
  @ApiProperty({
    description: 'Type of the Intervention',
    enum: Object.values(SCENARIO_INTERVENTION_TYPE),
    example: SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
  })
  type!: SCENARIO_INTERVENTION_TYPE;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Start year of the Intervention',
    type: Number,
    example: 2022,
  })
  startYear!: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'End year of the Intervention',
    type: Number,
    example: 2025,
  })
  endYear?: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Percentage of the chosen sourcing records affected by intervention',
    type: Number,
    example: 50,
  })
  percentage!: number;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Id of Scenario the intervention belongs to',
    type: 'uuid',
    example: 'a15e4933-cd9a-4afc-bd53-56941b816ef3',
  })
  scenarioId!: string;

  @IsUUID(4, { each: true })
  @IsNotEmpty()
  @ApiProperty({
    description: 'Ids of Materials that will be affected by intervention',
    type: [String],
    example: 'bc5e4933-cd9a-4afc-bd53-56941b816ef3',
  })
  materialIds!: string[];

  @IsUUID(4, { each: true })
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'Ids of Business Units that will be affected by intervention',
    type: [String],
    example: 'bc5e4933-cd9a-4afc-bd53-56941b812345',
  })
  businessUnitIds!: string[];

  @IsUUID(4, { each: true })
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Ids of Suppliers or Producers that will be affected by intervention',
    type: [String],
    example: 'bc5e4933-cd9a-4afc-bd53-56941b865432',
  })
  supplierIds!: string[];

  @IsUUID(4, { each: true })
  @IsNotEmpty()
  @ApiProperty({
    description: 'Ids of Admin Regions that will be affected by intervention',
    type: [String],
    example: 'bc5e4933-cd9a-4afc-bd53-56941b8adca3',
  })
  adminRegionIds!: string[];

  @IsOptional()
  @ApiPropertyOptional({
    type: () => IndicatorCoefficientsDto,
  })
  @ValidateIf(
    (dto: CreateScenarioInterventionDto) =>
      dto.newIndicatorCoefficients !== null,
  )
  @ValidateNested()
  @Type(() => IndicatorCoefficientsDto)
  newIndicatorCoefficients?: IndicatorCoefficientsDto;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({
    description: `Id of the New Supplier`,
    type: String,
    example: 'bc5e4933-cd9a-4afc-bd53-56941b8adc111',
  })
  newT1SupplierId?: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({
    description: `Id of the New Producer`,
    type: String,
    example: 'bc5e4933-cd9a-4afc-bd53-56941b8adc222',
  })
  newProducerId?: string;

  @ValidateIf(
    (dto: CreateScenarioInterventionDto) =>
      dto.type === SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL ||
      dto.type === SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
  )
  @IsNotEmpty({
    message:
      'New location type input is required for the selected intervention type',
  })
  @IsEnum(Object.values(LOCATION_TYPES), {
    message: `Available columns for new location type: ${Object.values(
      LOCATION_TYPES,
    ).join(', ')}`,
  })
  @ApiPropertyOptional({
    description: `Type of new Supplier Location, is required for Intervention types: ${SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL} and ${SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER}`,
    enum: Object.values(LOCATION_TYPES),
    example: LOCATION_TYPES.POINT_OF_PRODUCTION,
  })
  newLocationType!: LOCATION_TYPES;

  @ValidateIf(
    (dto: CreateScenarioInterventionDto) =>
      dto.type !== SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
  )
  @IsNotEmpty({
    message:
      'New Location Country input is required for the selected intervention and location type',
  })
  @ApiProperty({
    description: `New Supplier Location country, is required for Intervention types: ${SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL}, ${SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER}`,
    type: String,
    example: 'Spain',
  })
  newLocationCountryInput!: string;

  @ApiPropertyOptional({
    description: `
    New Supplier Location address, is required for Intervention types: ${SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL}, ${SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER}
    and New Supplier Locations of types: ${LOCATION_TYPES.POINT_OF_PRODUCTION} and ${LOCATION_TYPES.AGGREGATION_POINT}.

    Must be NULL for New Supplier Locations of types: ${LOCATION_TYPES.UNKNOWN} and ${LOCATION_TYPES.COUNTRY_OF_PRODUCTION}
    or if coordinates are provided for the relevant location types`,
    type: String,
    example: 'Main Street, 1',
  })
  newLocationAddressInput?: string;

  @ApiPropertyOptional({
    description: `
    New Supplier Location latitude, is required for Intervention types: ${SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL}, ${SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER}
    and New Supplier Locations of types: ${LOCATION_TYPES.POINT_OF_PRODUCTION} and ${LOCATION_TYPES.AGGREGATION_POINT}.

    Must be NULL for New Supplier Locations of types: ${LOCATION_TYPES.UNKNOWN} and ${LOCATION_TYPES.COUNTRY_OF_PRODUCTION}
    or if address is provided for the relevant location types.`,
    type: Number,
    minimum: -90,
    maximum: 90,
    example: 30.123,
  })
  newLocationLatitude?: number;

  @ApiPropertyOptional({
    description: `
    New Supplier Location longitude, is required for Intervention types: ${SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL}, ${SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER}
    and New Supplier Locations of types: ${LOCATION_TYPES.POINT_OF_PRODUCTION} and ${LOCATION_TYPES.AGGREGATION_POINT}.

    Must be NULL for New Supplier Locations of type: ${LOCATION_TYPES.UNKNOWN} and ${LOCATION_TYPES.COUNTRY_OF_PRODUCTION}
    or if address is provided for the relevant location types.`,
    type: Number,
    minimum: -180,
    maximum: 180,
    example: 100.123,
  })
  newLocationLongitude?: number;

  @ValidateIf(
    (dto: CreateScenarioInterventionDto) =>
      dto.type === SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
  )
  @IsNotEmpty({
    message: 'New Material is required for the selected intervention type',
  })
  @IsUUID()
  @ApiPropertyOptional({
    description: `Id of the New Material, is required if Intervention type is ${SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL}`,
    type: String,
    example: 'bc5e4933-cd9a-4afc-bd53-56941b8adc444',
  })
  newMaterialId?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    type: Number,
    description: `New Material tonnage ratio`,
    example: 0.5,
  })
  newMaterialTonnageRatio?: number;
}
