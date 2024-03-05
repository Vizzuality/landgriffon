import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class GetEUDRAlertsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  supplierIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  geoRegionIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  startYear: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  endYear: number;

  alertConfidence: 'high' | 'medium' | 'low';

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startAlertDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endAlertDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  limit: number = 1000;
}
