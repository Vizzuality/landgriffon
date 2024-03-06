import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class GetFeaturesGeoJsonDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { each: true })
  geoRegionIds!: string[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  collection: boolean = false;

  isEUDRRequested(): boolean {
    return 'eudr' in this;
  }
}

export class GetEUDRFeaturesGeoJSONDto extends GetFeaturesGeoJsonDto {
  @IsOptional()
  @IsBoolean()
  eudr: boolean = true;
}
