import { INDICATOR_TYPES } from 'modules/indicators/indicator.entity';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
