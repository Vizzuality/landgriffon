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
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
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
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  materialId!: string;

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
  @IsEnum(LOCATION_TYPES)
  @ApiPropertyOptional()
  locationType?: LOCATION_TYPES;

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
  locationAdminRegionInput?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @ApiPropertyOptional()
  locationCountryInput?: string;

  @IsString()
  @IsOptional()
  @IsEnum(LOCATION_ACCURACY)
  @ApiPropertyOptional()
  locationAccuracy?: LOCATION_ACCURACY;

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

  @IsOptional()
  locationWarning?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  sourcingLocationGroupId?: string;

  @IsString()
  @IsOptional()
  scenarioInterventionId?: string;

  @IsString()
  @IsOptional()
  interventionType?: SOURCING_LOCATION_TYPE_BY_INTERVENTION;

  @IsString()
  @IsOptional()
  geoRegionId?: string;

  @IsString()
  @IsOptional()
  adminRegionId?: string;
}
