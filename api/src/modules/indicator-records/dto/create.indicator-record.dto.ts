import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { INDICATOR_RECORD_STATUS } from 'modules/indicator-records/indicator-record.entity';

export class CreateIndicatorRecordDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  value!: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  sourcingRecordId?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  indicatorId!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  indicatorCoefficientId?: string;

  @IsString()
  @IsOptional()
  @IsEnum(Object.values(INDICATOR_RECORD_STATUS))
  @ApiPropertyOptional()
  status?: string;

  @IsString()
  @IsOptional()
  @MinLength(4)
  @MaxLength(50)
  @ApiPropertyOptional()
  statusMsg?: string;
}
