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
import { GeoRegion } from '../../geo-regions/geo-region.entity';
import { AdminRegion } from '../../admin-regions/admin-region.entity';
import { CreateSourcingRecordV2 } from '../../sourcing-records/dto/create.sourcing-record.dto';

export class CreateSourcingLocationV2 {
  locationType?: LOCATION_TYPES;

  @IsOptional()
  @IsString()
  locationAddressInput?: string;

  @IsOptional()
  @IsString()
  locationAdminRegionInput?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  locationCountryInput?: string;

  @IsString()
  @IsOptional()
  @IsEnum(LOCATION_ACCURACY)
  locationAccuracy?: LOCATION_ACCURACY;

  @IsNumber()
  @IsOptional()
  locationLatitude?: number;

  @IsNumber()
  @IsOptional()
  locationLongitude?: number;

  @IsOptional()
  metadata?: JSON;

  @IsOptional()
  locationWarning?: string;

  @IsString()
  @IsOptional()
  sourcingLocationGroupId?: string;

  sourcingRecords: CreateSourcingRecordV2[];
}

export class GeoCodedSourcingLocation extends CreateSourcingLocationV2 {
  geoRegion: GeoRegion;

  adminRegion: AdminRegion;
}
