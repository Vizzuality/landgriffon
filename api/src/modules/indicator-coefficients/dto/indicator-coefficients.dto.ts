import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class IndicatorCoefficientsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNumber()
  [INDICATOR_NAME_CODES.WATER_USE]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_NAME_CODES.UNSUSTAINABLE_WATER_USE]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_NAME_CODES.CLIMATE_RISK]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_NAME_CODES.DEFORESTATION_RISK]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_NAME_CODES.LAND_USE]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_NAME_CODES.SATELLIGENCE_DEFORESTATION]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_NAME_CODES.SATELLIGENCE_DEFORESTATION_RISK]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_NAME_CODES.NATURAL_ECOSYSTEM_CONVERSION_RISK]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_NAME_CODES.WATER_QUALITY]: number;
}
