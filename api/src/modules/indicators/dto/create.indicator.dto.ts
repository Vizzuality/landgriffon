import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { INDICATOR_STATUS } from 'modules/indicators/indicator.entity';

export class CreateIndicatorDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(500)
  @ApiProperty()
  name!: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsEnum(INDICATOR_STATUS)
  @ApiPropertyOptional()
  status: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  nameCode: string;

  @IsString()
  @IsOptional()
  @IsJSON()
  @ApiPropertyOptional()
  metadata?: string;
}
