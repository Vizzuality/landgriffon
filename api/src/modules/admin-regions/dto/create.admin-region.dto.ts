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
import { ADMIN_REGIONS_STATUS } from 'modules/admin-regions/admin-region.entity';

export class CreateAdminRegionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsEnum(Object.values(ADMIN_REGIONS_STATUS))
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
