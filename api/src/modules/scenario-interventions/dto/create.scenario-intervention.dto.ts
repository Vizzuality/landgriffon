import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { SCENARIO_INTERVENTION_TYPE } from 'modules/scenario-interventions/scenario-intervention.entity';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';

export class CreateScenarioInterventionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  title!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Object.values(SCENARIO_INTERVENTION_TYPE))
  @ApiProperty()
  type!: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  startYear!: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  endYear?: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  percentage!: number;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  scenarioId!: string;

  @IsUUID(4, { each: true })
  @IsNotEmpty()
  @ApiProperty()
  materialsIds!: string[];

  @IsUUID(4, { each: true })
  @IsNotEmpty()
  @ApiPropertyOptional()
  businessUnitsIds!: string[];

  @IsUUID(4, { each: true })
  @IsNotEmpty()
  @ApiProperty()
  suppliersIds!: string[];

  @IsUUID(4, { each: true })
  @IsOptional()
  @ApiProperty()
  adminRegionsIds?: string[];

  @IsJSON()
  @IsNotEmpty()
  @ApiProperty()
  newIndicatorCoefficients!: JSON;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional()
  newT1SupplierId?: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional()
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
  @ApiPropertyOptional()
  newLocationType?: LOCATION_TYPES;

  @IsNotEmpty({
    message:
      'New country input is required for the selected intervention and location type',
  })
  @ApiProperty()
  newLocationCountryInput!: string;

  @ValidateIf(
    (dto: CreateScenarioInterventionDto) =>
      (dto.type === SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL ||
        dto.type === SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER) &&
      (dto.newLocationType === LOCATION_TYPES.AGGREGATION_POINT ||
        dto.newLocationType === LOCATION_TYPES.POINT_OF_PRODUCTION),
  )
  @IsNotEmpty({
    message:
      'New address or coordinates input is required for the selected intervention and location type',
  })
  @ApiPropertyOptional()
  newAddressInput?: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional()
  newGeoRegionId?: string;

  @ValidateIf(
    (dto: CreateScenarioInterventionDto) =>
      dto.type === SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
  )
  @IsNotEmpty({
    message: 'New Material is required for the selected intervention type',
  })
  @IsUUID()
  @ApiPropertyOptional()
  newMaterialId?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  newMaterialTonnageRatio?: number;
}
