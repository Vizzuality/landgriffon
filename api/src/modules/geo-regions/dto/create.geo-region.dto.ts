import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsJSON,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGeoRegionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @ApiPropertyOptional()
  name!: string;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional()
  h3Compact?: string[];

  @IsJSON()
  @IsOptional()
  @IsJSON()
  @ApiPropertyOptional()
  theGeom?: string;
}
