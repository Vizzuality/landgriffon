import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsJSON,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateIndicatorSourceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  title!: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsJSON()
  @ApiPropertyOptional()
  metadata?: string;

  @IsString()
  @ApiProperty()
  layerId!: string;
}
