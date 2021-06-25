import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsJSON,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MATERIALS_STATUS } from 'modules/materials/material.entity';

export class CreateMaterialDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  name!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsEnum(Object.values(MATERIALS_STATUS))
  @ApiPropertyOptional()
  status?: string;

  @IsString()
  @IsOptional()
  @IsJSON()
  @ApiPropertyOptional()
  metadata?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  parent?: string;

  @IsString()
  @ApiProperty()
  layerId!: string;
}
