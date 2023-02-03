import {
  INDICATOR_TYPES,
  INDICATOR_TYPES_NEW,
} from 'modules/indicators/indicator.entity';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IndicatorCoefficientsDto {
  @ApiProperty()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES.DEFORESTATION]: number;

  @ApiProperty()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE]: number;

  @ApiProperty()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES.BIODIVERSITY_LOSS]: number;

  @ApiProperty()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES.CARBON_EMISSIONS]: number;

  @ApiProperty()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES.CARBON_EMISSIONS]: number;
}

export class IndicatorCoefficientsDtoV2 {
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
