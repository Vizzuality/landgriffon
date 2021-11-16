import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { GROUP_BY_VALUES } from 'modules/h3-data/dto/get-impact-map.dto';

export class GetImpactTableDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString({ each: true })
  @Type(() => String)
  indicatorIds?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  startYear!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  endYear!: number;

  @ApiProperty()
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  @IsEnum(GROUP_BY_VALUES)
  groupBy!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  materialIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  originIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  supplierIds?: string[];
}
