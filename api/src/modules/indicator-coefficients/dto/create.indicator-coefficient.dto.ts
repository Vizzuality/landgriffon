import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateIndicatorCoefficientDto {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  value?: number;

  @IsNumber()
  @ApiProperty()
  year!: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  indicatorSourceId?: string;
}
