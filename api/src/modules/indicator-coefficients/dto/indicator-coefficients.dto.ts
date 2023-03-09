import { INDICATOR_TYPES } from 'modules/indicators/indicator.entity';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class IndicatorCoefficientsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNumber()
  [INDICATOR_TYPES.WATER_USE]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES.CLIMATE_RISK]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES.DEFORESTATION_RISK]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES.LAND_USE]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES.SATELLIGENCE_DEFORESTATION]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES.SATELLIGENCE_DEFORESTATION_RISK]: number;
}
