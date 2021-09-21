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
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  @IsNotEmpty()
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(40)
  @ApiPropertyOptional()
  businessUnitId?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(40)
  @ApiPropertyOptional()
  materialId?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(40)
  @ApiPropertyOptional()
  t1SupplierId?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(40)
  @ApiPropertyOptional()
  producerId?: string;

  @IsString()
  @IsOptional()
  @IsEnum(Object.values(LOCATION_TYPES))
  @ApiPropertyOptional()
  locationType?: string;

  @IsOptional()
  @IsString()
  /**
   * @debt: MinLength validation giving troubles with current data-set even
   * this property is not mandatory. Check and fix required
   */
  //@MinLength(3)
  @ApiPropertyOptional()
  locationAddressInput?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
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

  @IsOptional()
  @ApiPropertyOptional()
  metadata?: JSON;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  sourcingLocationGroupId?: string;
}
