import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  BUSINESS_UNIT_STATUS,
  BusinessUnit,
} from 'modules/business-units/business-unit.entity';

export class CreateBusinessUnitDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(400)
  @ApiProperty()
  name!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsEnum(BUSINESS_UNIT_STATUS)
  @ApiPropertyOptional()
  status?: string;

  @IsOptional()
  parent?: BusinessUnit;

  @IsString()
  @IsOptional()
  @IsJSON()
  @ApiPropertyOptional()
  metadata?: string;

  @IsString()
  @IsOptional()
  mpath?: string;
}
