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
import {
  SCENARIO_INTERVENTION_STATUS,
  SCENARIO_INTERVENTION_TYPE,
} from 'modules/scenario-interventions/scenario-intervention.entity';
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
  @IsOptional()
  @IsEnum(Object.values(SCENARIO_INTERVENTION_STATUS))
  @ApiPropertyOptional()
  status?: string;

  @IsString()
  @IsOptional()
  @IsEnum(Object.values(SCENARIO_INTERVENTION_TYPE))
  @ApiPropertyOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  startYear?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  endYear?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  percentage?: number;

  @IsUUID(4, { each: true })
  @IsOptional()
  @ApiPropertyOptional()
  materialsIds: string[];

  @IsUUID(4, { each: true })
  @IsOptional()
  @ApiPropertyOptional()
  businessUnitsIds: string[];

  @IsUUID(4, { each: true })
  @IsOptional()
  @ApiPropertyOptional()
  suppliersIds: string[];

  @IsUUID(4, { each: true })
  @IsOptional()
  @ApiPropertyOptional()
  adminRegionsIds: string[];

  @IsUUID(4, { each: true })
  @IsOptional()
  @ApiPropertyOptional()
  sourcingLocationsIds: string[];

  @IsString()
  @IsOptional()
  @IsJSON()
  @ApiPropertyOptional()
  newIndicatorCoefficients?: JSON;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional()
  newSupplierT1Id?: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional()
  newProducerId?: string;

  @IsUUID()
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
