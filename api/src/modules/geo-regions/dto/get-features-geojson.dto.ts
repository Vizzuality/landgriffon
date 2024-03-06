import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import {
  CommonEUDRFiltersDTO,
  CommonFiltersDto,
} from 'utils/base.query-builder';

export class GetFeaturesGeoJsonDto extends CommonFiltersDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  collection: boolean = false;
}

export class GetEUDRFeaturesGeoJSONDto extends CommonEUDRFiltersDTO {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  collection: boolean = false;
}
