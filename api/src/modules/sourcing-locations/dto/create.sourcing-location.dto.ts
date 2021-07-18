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
import {
  LOCATION_ACCURACY,
  LOCATION_TYPES,
} from 'modules/sourcing-locations/sourcing-location.entity';

export class CreateSourcingLocationDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(40)
  @ApiPropertyOptional()
  businessUnitId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  t1SupplierId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  producerId?: string;

  @IsString()
  @IsOptional()
  @IsEnum(Object.values(LOCATION_TYPES))
  @ApiPropertyOptional()
  locationType?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  locationAddressInput?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  locationCountryInput?: string;

  @IsString()
  @IsOptional()
  @IsEnum(Object.values(LOCATION_ACCURACY))
  @ApiPropertyOptional()
  locationAccuracy?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  locationLatitude?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  locationLongitude?: number;
}
