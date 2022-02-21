import { CacheModule, Module } from '@nestjs/common';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { GeoRegionsModule } from 'modules/geo-regions/geo-regions.module';
import { UnknownLocationService } from 'modules/geo-coding/geocoding-strategies/unknown-location.geocoding.service';
import { CountryOfProductionService } from 'modules/geo-coding/geocoding-strategies/country-of-production.geocoding.service';
import { AggregationPointGeocodingService } from 'modules/geo-coding/geocoding-strategies/aggregation-point.geocoding.service';
import { PointOfProductionGeocodingService } from 'modules/geo-coding/geocoding-strategies/point-of-production.geocoding.service';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { GeoCodingService } from 'modules/geo-coding/geo-coding.service';
import * as redisStore from 'cache-manager-redis-store';
import * as config from 'config';
import { GeoCodingCacheableBaseService } from 'modules/geo-coding/geo-coding-cacheable.base.service';

const redisConfig: any = config.get('redis');

@Module({
  imports: [
    AdminRegionsModule,
    GeoRegionsModule,
    SourcingLocationsModule,
    CacheModule.register({
      store: redisStore,
      host: redisConfig.host,
      port: redisConfig.port,
      ttl: redisConfig.geocodingTTL,
    }),
  ],
  providers: [
    GeoCodingCacheableBaseService,
    GeoCodingService,
    UnknownLocationService,
    CountryOfProductionService,
    AggregationPointGeocodingService,
    PointOfProductionGeocodingService,
  ],
  exports: [GeoCodingService],
})
export class GeoCodingModule {}
