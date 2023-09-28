import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class IndicatorCoefficientsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNumber()
  [INDICATOR_NAME_CODES.LF]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_NAME_CODES.DF_SLUC]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_NAME_CODES.GHG_DEF_SLUC]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_NAME_CODES.GHG_FARM]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_NAME_CODES.UWU]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_NAME_CODES.WU]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_NAME_CODES.NL]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_NAME_CODES.ENL]: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Max(1000000)
  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_NAME_CODES.NCE]: number;
}
