import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { GeoRegionsModule } from 'modules/geo-regions/geo-regions.module';
import { UnknownLocationGeoCodingStrategy } from 'modules/geo-coding/strategies/unknown-location.geocoding.service';
import { CountryOfProductionGeoCodingStrategy } from 'modules/geo-coding/strategies/country-of-production.geocoding.service';
import { AggregationPointGeocodingStrategy } from 'modules/geo-coding/strategies/aggregation-point.geocoding.service';
import { PointOfProductionGeocodingStrategy } from 'modules/geo-coding/strategies/point-of-production.geocoding.service';
import { AdminRegionOfProductionService } from 'modules/geo-coding/strategies/admin-region-of-production.service';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { GeoCodingService } from 'modules/geo-coding/geo-coding.service';
import { CacheGeocoder } from 'modules/geo-coding/geocoders/cache.geocoder';
import { GoogleMapsGeocoder } from 'modules/geo-coding/geocoders/google-maps.geocoder';
import * as redisStore from 'cache-manager-redis-store';
import * as config from 'config';
import { GeoLocationCacheService, GEO_CACHE_TTL } from './cache.manager';
import { GeocoderService } from './geocoders/geocoder.service';
import { GeoCodingServiceV2 } from './geo-coding.service-v2';
import { GeocodingRepository } from './strategies_v2/geocoding.repository';

const geocodingCacheConfig: any = config.get('geocodingCache');

const geocodingCacheTTL: number = parseInt(
  `${geocodingCacheConfig.geocodingCacheTTL}`,
  10,
);

@Module({
  imports: [
    AdminRegionsModule,
    GeoRegionsModule,
    SourcingLocationsModule,
    CacheModule.register({
      store: geocodingCacheConfig.store === 'redis' ? redisStore : 'memory',
      host: geocodingCacheConfig.host,
      port: geocodingCacheConfig.port,
      db: geocodingCacheConfig.database,
      ttl: geocodingCacheTTL,
    }),
  ],
  providers: [
    GeoLocationCacheService,
    { provide: GEO_CACHE_TTL, useValue: 6_000 },
    GeocoderService,
    GoogleMapsGeocoder,
    {
      provide: CacheGeocoder,
      useClass: CacheGeocoder,
    },
    {
      provide: GeoCodingService,
      useClass: GeoCodingService,
    },
    GeoCodingServiceV2,
    UnknownLocationGeoCodingStrategy,
    CountryOfProductionGeoCodingStrategy,
    AggregationPointGeocodingStrategy,
    PointOfProductionGeocodingStrategy,
    AdminRegionOfProductionService,
  ],
  exports: [
    GeoCodingService,
    GeoCodingServiceV2
  ],
})
export class GeoCodingModule { }
