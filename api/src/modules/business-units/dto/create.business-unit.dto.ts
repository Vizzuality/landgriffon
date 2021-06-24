import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  MaxLength,
  MinLength,
  IsString,
  IsJSON,
  IsEnum,
} from 'class-validator';
import { BUSINESS_UNIT_STATUS } from 'modules/business-units/business-unit.entity';

export class CreateBusinessUnitDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  name!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsEnum(Object.values(BUSINESS_UNIT_STATUS))
  @ApiPropertyOptional()
  status?: string;

  @IsString()
  @IsOptional()
  @IsJSON()
  @ApiPropertyOptional()
  metadata?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  parent?: string;
}
