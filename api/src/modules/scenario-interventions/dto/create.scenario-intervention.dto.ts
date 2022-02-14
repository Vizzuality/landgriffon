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
  @IsOptional()
  @ApiPropertyOptional()
  startYear?: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  endYear!: number;

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
  @IsOptional()
  @ApiPropertyOptional()
  businessUnitsIds?: string[];

  @IsUUID(4, { each: true })
  @IsOptional()
  @ApiPropertyOptional()
  suppliersIds?: string[];

  @IsUUID(4, { each: true })
  @IsOptional()
  @ApiPropertyOptional()
  adminRegionsIds?: string[];

  @IsString()
  @IsNotEmpty()
  @IsJSON()
  @ApiProperty()
  newIndicatorCoefficients!: JSON;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional()
  newSupplierT1Id?: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional()
  newProducerId?: string;

  @IsEnum(Object.values(LOCATION_TYPES))
  @IsOptional()
  @ApiPropertyOptional()
  newLocationType?: LOCATION_TYPES;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  newCountryInput?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  newAddressInput?: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional()
  newGeoRegionId?: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional()
  newMaterialId?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  newMaterialTonnageRatio?: number;
}
