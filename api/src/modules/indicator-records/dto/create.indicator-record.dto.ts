import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TASK_STATUS } from 'modules/indicator-records/indicator-record.entity';

export class CreateIndicatorRecordDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiPropertyOptional()
  value!: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  sourcingRecordId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  indicatorId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  indicatorCoefficientId?: string;

  @IsString()
  @IsOptional()
  @IsEnum(Object.values(TASK_STATUS))
  @ApiPropertyOptional()
  status?: string;

  @IsString()
  @IsOptional()
  @MinLength(4)
  @MaxLength(50)
  @ApiPropertyOptional()
  statusMsg: string;
}
