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
  ADMIN_REGIONS_STATUS,
  AdminRegion,
} from 'modules/admin-regions/admin-region.entity';

export class CreateAdminRegionDto {
  @IsString()
  @IsNotEmpty({ message: 'Admin Region Name must not be empty' })
  @MinLength(1, { message: 'Admin Region Name is too short' })
  @MaxLength(400, { message: 'Admin Region Name is too long' })
  @ApiProperty()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  isoA2?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  isoA3?: string;

  @IsString()
  @IsOptional()
  @IsEnum(ADMIN_REGIONS_STATUS)
  @ApiPropertyOptional()
  status?: string;

  @IsString()
  @IsOptional()
  @IsJSON()
  @ApiPropertyOptional()
  metadata?: string;

  @IsOptional()
  parent?: AdminRegion;

  @IsString()
  @IsOptional()
  mpath?: string;
}
