import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class GetEUDRAlertsDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  supplierIds: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  geoRegionIds: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  startYear: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  endYear: number;

  alertConfidence: 'high' | 'medium' | 'low';

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startAlertDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endAlertDate: Date;

  @IsOptional()
  @IsInt()
  limit: number = 1000;
}
