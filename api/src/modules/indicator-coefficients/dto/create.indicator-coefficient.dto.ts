import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateIndicatorCoefficientDto {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  value?: number;

  @IsNumber()
  @ApiProperty()
  year!: number;
}
