import {
  INDICATOR_TYPES,
  INDICATOR_TYPES_NEW,
} from 'modules/indicators/indicator.entity';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IndicatorCoefficientsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNumber()
  [INDICATOR_TYPES_NEW.WATER_USE]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES_NEW.CLIMATE_RISK]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES_NEW.DEFORESTATION_RISK]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES_NEW.LAND_USE]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES_NEW.SATELLIGENCE_DEFORESTATION]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES_NEW.SATELLIGENCE_DEFORESTATION_RISK]: number;
}
