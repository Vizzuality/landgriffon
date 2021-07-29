import { Module } from '@nestjs/common';
import { GeoCodingBaseService } from 'modules/geo-coding/geo-coding.base.service';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { GeoRegionsModule } from 'modules/geo-regions/geo-regions.module';
import { UnknownLocationService } from 'modules/geo-coding/geocoding-strategies/unknown-location.geocoding.service';
import { CountryOfProductionService } from 'modules/geo-coding/geocoding-strategies/country-of-production.geocoding.service';
import { AggregationPointGeocodingService } from 'modules/geo-coding/geocoding-strategies/aggregation-point.geocoding.service';
import { PointOfProductionGeocodingService } from 'modules/geo-coding/geocoding-strategies/point-of-production.geocoding.service';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { GeoCodingService } from 'modules/geo-coding/geo-coding.service';

@Module({
  imports: [AdminRegionsModule, GeoRegionsModule, SourcingLocationsModule],
  providers: [
    GeoCodingService,
    GeoCodingBaseService,
    UnknownLocationService,
    CountryOfProductionService,
    AggregationPointGeocodingService,
    PointOfProductionGeocodingService,
  ],
  exports: [GeoCodingService],
})
export class GeoCodingModule {}
