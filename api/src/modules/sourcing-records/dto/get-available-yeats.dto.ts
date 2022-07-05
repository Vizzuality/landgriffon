import { IsEnum, IsOptional, IsUUID, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  LOCATION_TYPES,
  LOCATION_TYPES_PARAMS,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { Transform, Type } from 'class-transformer';
import { transformLocationType } from 'utils/transform-location-type.util';

export class GetAvailableYeatsDto {
  @ApiPropertyOptional({
    description: 'Ids of Materials that will be affected by intervention',
    type: [String],
  })
  @ValidateIf((dto: GetAvailableYeatsDto) => dto.materialIds.length > 0)
  @IsUUID(4, { each: true })
  @ApiPropertyOptional({
    description: 'Ids of Materials that will be affected by intervention',
    type: [String],
  })
  materialIds!: string[];

  @IsUUID(4, { each: true })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Ids of Business Units that will be affected by intervention',
    type: [String],
  })
  businessUnitIds?: string[];

  @IsUUID(4, { each: true })
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'Ids of Suppliers or Producers that will be affected by intervention',
    type: [String],
  })
  supplierIds?: string[];

  @IsUUID(4, { each: true })
  @IsOptional()
  @ApiProperty({
    description: 'Ids of Admin Regions that will be affected by intervention',
    type: [String],
  })
  adminRegionIds?: string[];

  @ApiPropertyOptional({
    description: 'Types of Sourcing Locations, written with hyphens',
    enum: Object.values(LOCATION_TYPES_PARAMS),
    name: 'locationTypes[]',
  })
  @IsOptional()
  @IsEnum(LOCATION_TYPES, {
    each: true,
    message:
      'Available options: ' +
      Object.values(LOCATION_TYPES_PARAMS).toString().toLowerCase(),
  })
  @Transform(({ value }: { value: LOCATION_TYPES_PARAMS[] }) =>
    transformLocationType(value),
  )
  @Type(() => String)
  locationTypes?: LOCATION_TYPES_PARAMS[];
}
