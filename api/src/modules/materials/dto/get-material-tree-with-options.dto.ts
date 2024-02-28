import { IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  CommonEUDRFiltersDTO,
  CommonFiltersDto,
} from 'utils/base.query-builder';

export class GetMaterialTreeWithOptionsDto extends CommonFiltersDto {
  @ApiPropertyOptional({
    description:
      'Return Materials with related Sourcing Locations. Setting this to true will override depth param',
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

export class GetEUDRMaterials extends CommonEUDRFiltersDTO {
  withSourcingLocations!: boolean;
}
