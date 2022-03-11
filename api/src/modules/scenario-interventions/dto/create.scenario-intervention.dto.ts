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
import { IndicatorCoefficientsInterface } from 'modules/indicator-coefficients/interfaces/indicator-coefficients.interface';

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
  newIndicatorCoefficients!: IndicatorCoefficientsInterface;

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
      'New Location Country input is required for the selected intervention and location type',
  })
  @ApiProperty()
  newLocationCountryInput!: string;

  @ApiPropertyOptional()
  newLocationAddressInput?: string;

  @ApiPropertyOptional()
  newLocationLatitude?: number;

  @ApiPropertyOptional()
  newLocationLongitude?: number;

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
