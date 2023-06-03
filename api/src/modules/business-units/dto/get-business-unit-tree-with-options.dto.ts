import { IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CommonFiltersDto } from 'utils/base.query-builder';

export class GetBusinessUnitTreeWithOptionsDto extends CommonFiltersDto {
  @ApiPropertyOptional({
    description:
      'Return Business Units with related Sourcing Locations. Setting this to true will override depth param',
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

  @ApiPropertyOptional({
    description: 'Array of Scenario Ids to include in the business unit search',
  })
  @IsOptional()
  @IsUUID('4')
  scenarioId?: string;
}
