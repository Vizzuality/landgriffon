import { IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommonFiltersDto } from 'utils/base.query-builder';
import { Type } from 'class-transformer';

export class GetAdminRegionTreeWithOptionsDto extends CommonFiltersDto {
  @ApiPropertyOptional({
    description:
      'Return Admin Regions with related Sourcing Locations. Setting this to true will override depth param',
  })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  withSourcingLocations?: boolean;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  depth?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  scenarioId?: string;
}
