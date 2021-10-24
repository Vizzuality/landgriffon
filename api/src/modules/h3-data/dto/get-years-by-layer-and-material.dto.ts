// DTO to query available years by layer

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { LAYER_TYPES } from 'modules/h3-data/h3-data.entity';

export class GetYearsByLayerAndMaterialDto {
  @ApiProperty()
  @IsEnum(LAYER_TYPES, {
    message: 'Available layers types: impact, risk, material',
  })
  layer!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  materialId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  indicatorId?: string;
}
