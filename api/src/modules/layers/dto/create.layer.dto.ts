import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsJSON,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { LAYERS_STATUS } from 'modules/layers/layer.entity';

export class CreateLayerDto {
  @IsString()
  @MinLength(2)
  @ApiProperty()
  text!: string;

  @IsString()
  @IsJSON()
  @IsOptional()
  @ApiPropertyOptional()
  layerManagerConfig?: string;

  @IsString()
  @IsOptional()
  @IsEnum(Object.values(LAYERS_STATUS))
  @ApiPropertyOptional()
  status?: string;

  @IsString()
  @IsOptional()
  @IsJSON()
  @ApiPropertyOptional()
  metadata?: string;
}
