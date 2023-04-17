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
  @IsNotEmpty({ message: 'Business Unit Name must not be empty' })
  @MinLength(1, { message: 'Business Unit Name is too short' })
  @MaxLength(400, { message: 'Business Unit Name is too long' })
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
