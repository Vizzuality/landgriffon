import { INDICATOR_TYPES } from 'modules/indicators/indicator.entity';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IndicatorCoefficientsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES.DEFORESTATION]: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE]: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES.BIODIVERSITY_LOSS]: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  [INDICATOR_TYPES.CARBON_EMISSIONS]: number;
}
