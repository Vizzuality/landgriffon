import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  SCENARIO_INTERVENTION_STATUS,
  SCENARIO_INTERVENTION_TYPE,
} from 'modules/scenario-interventions/scenario-intervention.entity';

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

  @IsString()
  @IsOptional()
  @IsJSON()
  @ApiPropertyOptional()
  newIndicatorCoefficients?: JSON;
}
