import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateUnitConversionDto {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  unit1?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  unit2?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  factor?: number;
}
