import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { GROUP_BY_VALUES } from 'modules/h3-data/dto/get-impact-map.dto';
import { LOCATION_TYPES_PARAMS } from 'modules/sourcing-locations/sourcing-location.entity';

export class GetImpactTableDto {
  @ApiProperty()
  @IsUUID(4, { each: true })
  @Type(() => String)
  indicatorIds!: string[];

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  startYear!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  endYear!: number;

  @ApiProperty()
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  @IsEnum(GROUP_BY_VALUES, {
    message:
      'Available options: ' +
      Object.keys(GROUP_BY_VALUES).toString().toLowerCase(),
  })
  groupBy!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID(4, { each: true })
  @Type(() => String)
  materialIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID(4, { each: true })
  @Type(() => String)
  originIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID(4, { each: true })
  @Type(() => String)
  supplierIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(LOCATION_TYPES_PARAMS, { each: true })
  @Type(() => String)
  locationType?: LOCATION_TYPES_PARAMS[];
}

export class GetRankedImpactTableDto extends GetImpactTableDto {
  @ApiProperty({
    description:
      'The maximum number of entities to show in the Impact Table. If the result includes more than that, they will be' +
      'aggregated into the "other" field in the response',
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  maxRankingEntities: number;

  @ApiProperty({
    description: `The sort order for the resulting entities. Can be 'ASC' (Ascendant) or 'DES' (Descendent), with the default being 'DES'`,
  })
  @Type(() => String)
  @IsString()
  @IsOptional()
  @IsIn(['ASC', 'DES'], {
    message: `sort property must be either 'ASC' (Ascendant) or 'DES' (Descendent)`,
  })
  sort?: string; // ASC or DESC, will be DESC by default
}
