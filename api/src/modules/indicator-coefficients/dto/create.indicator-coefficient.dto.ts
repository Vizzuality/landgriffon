import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateIndicatorCoefficientDto {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  value?: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  year!: number;
}
