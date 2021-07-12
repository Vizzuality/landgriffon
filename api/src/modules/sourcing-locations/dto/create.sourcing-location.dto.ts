import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
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
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  @IsNotEmpty()
  title!: string;

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

  @IsString()
  @IsOptional()
  @MinLength(2)
  @ApiPropertyOptional()
  locationAddressInput?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @ApiPropertyOptional()
  locationCountryInput?: string;

  @IsString()
  @IsOptional()
  @IsEnum(Object.values(LOCATION_ACCURACY))
  @ApiPropertyOptional()
  locationAccuracy?: string;
}
