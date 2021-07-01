import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsJSON,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { INDICATOR_STATUS } from 'modules/indicators/indicator.entity';

export class CreateIndicatorDto {
  @IsString()
  @MinLength(2)
  @ApiProperty()
  name!: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsEnum(Object.values(INDICATOR_STATUS))
  @ApiPropertyOptional()
  status?: string;

  @IsString()
  @IsOptional()
  @IsJSON()
  @ApiPropertyOptional()
  metadata?: string;
}
