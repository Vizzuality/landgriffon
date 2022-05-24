import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AvailableResolutions } from 'modules/h3-data/dto/get-material-h3-by-resolution.dto';
import { LOCATION_TYPES_PARAMS } from 'modules/sourcing-locations/sourcing-location.entity';

export enum GROUP_BY_VALUES {
  MATERIAL = 'material',
  BUSINESS_UNIT = 'business-unit',
  REGION = 'region',
  SUPPLIER = 'supplier',
  LOCATION_TYPE = 'location-type',
}

export class GetImpactMapDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  indicatorId: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  year!: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(6)
  @IsEnum(AvailableResolutions, { message: 'Available resolutions: 1 to 6' })
  resolution!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  materialIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  originIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  supplierIds?: string[];

  @ApiPropertyOptional({
    description: 'Type of Sourcing Location, written with hyphens',
    enum: Object.values(LOCATION_TYPES_PARAMS),
  })
  @IsOptional()
  @IsEnum(LOCATION_TYPES_PARAMS, {
    each: true,
    message:
      'Available options: ' +
      Object.values(LOCATION_TYPES_PARAMS).toString().toLowerCase(),
  })
  @Type(() => String)
  locationTypes?: LOCATION_TYPES_PARAMS[];
}
