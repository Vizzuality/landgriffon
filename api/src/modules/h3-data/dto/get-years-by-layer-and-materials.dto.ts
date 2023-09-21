// DTO to query available years by layer

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { LAYER_TYPES } from 'modules/h3-data/entities/h3-data.entity';
import { Type } from 'class-transformer';

export class GetYearsByLayerAndMaterialsDto {
  @ApiProperty()
  @IsEnum(LAYER_TYPES, {
    message: 'Available layers types: impact, risk, material',
  })
  layer!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  materialIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  indicatorId?: string;
}
