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
import { Material, MATERIALS_STATUS } from 'modules/materials/material.entity';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(300)
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
  parentId?: string;

  @IsOptional()
  parent?: Material;

  @IsString()
  @ApiProperty()
  hsCodeId!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  earthstatId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  mapspamId?: string;

  @IsString()
  @IsOptional()
  mpath?: string;

  @IsOptional()
  datasetId?: string;
}
