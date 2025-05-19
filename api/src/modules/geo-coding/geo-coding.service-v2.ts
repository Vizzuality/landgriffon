import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdminRegion } from '../admin-regions/admin-region.entity';
import { GeoRegion } from '../geo-regions/geo-region.entity';
import {
  CreateSourcingLocationV2,
  GeoCodedSourcingLocation,
} from '../sourcing-locations/dto/create-sourcing-location-v2.dto';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from '../sourcing-locations/sourcing-location.entity';
import { GeoLocationCacheService } from './cache.manager';
import { GeoCodingError } from './errors/geo-coding.error';

import { CacheGeocoder } from './geocoders/cache.geocoder';
import { AdminRegionOfProductionGeocodingStrategy } from './strategies_v2/admin-region-of-production.service';
import { AggregationPointGeocodingStrategy } from './strategies_v2/aggregation-point.geocoding.service';
import { CountryOfProductionGeoCodingStrategy } from './strategies_v2/country-of-production.geocoding.service';
import { IGeoCodingStrategy } from './strategies_v2/geo-coding.strategy.interface';
import { GeocodingRepository } from './strategies_v2/geocoding.repository';
import { PointOfProductionGeocodingStrategy } from './strategies_v2/point-of-production.geocoding.service';
import { UnknownLocationGeoCodingStrategy } from './strategies_v2/unknown-location.geocoding.service';


export class SourcingLocationInfo {
  locationAddressInput?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  locationAdminRegionInput?: string;
  locationCountryInput: string;
  locationType: LOCATION_TYPES;
}

export class GeoCodedLocation {
  adminRegion: AdminRegion;
  geoRegion: GeoRegion;
  locationWarning?: string;
}

export interface GeoCodeResult {
  geocodedSourcingLocations: GeoCodedSourcingLocation[];
  geoCodingErrors: ErrorRecord[];
}

interface ErrorRecord {
  row: number;
  error: string;
  type: string;
  sheet: string;
  column: string | null;
}

@Injectable()
export class GeoCodingServiceV2 {
  private readonly geocodingRepository: GeocodingRepository;
  private readonly logger = new Logger(GeoCodingServiceV2.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly cache: GeoLocationCacheService,
    private readonly geocoder: CacheGeocoder,
  ) {
    this.geocodingRepository = new GeocodingRepository(this.dataSource.manager);
  }

  /**
   * Geocode a batch of sourcing locations in a single transaction.
   */
  async geocode(locations: CreateSourcingLocationV2[]): Promise<GeoCodeResult> {
    const results: GeoCodedSourcingLocation[] = [];
    const errors: ErrorRecord[] = [];

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      // The strategies need to use a geocoding repository that uses
      // the transactionalEntityManager to ensure that all operations
      // are part of the same transaction.
      const transactionalRepo = new GeocodingRepository(transactionalEntityManager);
      const strategies = this.initializeStrategies(transactionalRepo);

      for (const [index, location] of locations.entries()) {
        const locationInfo = this.mapToLocationInfo(location);
        this.logger.debug(`Processing row ${index + 1}: ${JSON.stringify(locationInfo)}`);

        try {
          const geoData = await this.lookupOrFetchGeo(locationInfo, strategies);
          const saved = await transactionalEntityManager.save(SourcingLocation, { ...location, ...geoData });
          results.push(saved);

        } catch (err: any) {
          this.logger.error(`Error on row ${index + 1}: ${err.message}`, err.stack);

          if (err instanceof GeoCodingError) {
            errors.push({
              row: index + 1,
              error: err.message,
              type: 'geo-coding-error',
              sheet: 'sourcingData',
              column: null,
            });

          } else {
            // Non-GeoCoding errors trigger a rollback
            throw err;
          }
        }
      }
    });

    return {
      geocodedSourcingLocations: results,
      geoCodingErrors: errors,
    };
  }

  /** Instantiate and map each LOCATION_TYPES to its strategy */
  private initializeStrategies(geocodingRepository: GeocodingRepository): Record<LOCATION_TYPES, IGeoCodingStrategy> {
    return {
      [LOCATION_TYPES.UNKNOWN]: new UnknownLocationGeoCodingStrategy(geocodingRepository, this.geocoder),
      [LOCATION_TYPES.POINT_OF_PRODUCTION]: new PointOfProductionGeocodingStrategy(geocodingRepository, this.geocoder),
      [LOCATION_TYPES.COUNTRY_OF_PRODUCTION]: new CountryOfProductionGeoCodingStrategy(geocodingRepository),
      [LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT]: new AggregationPointGeocodingStrategy(geocodingRepository, this.geocoder),
      [LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION]: new AdminRegionOfProductionGeocodingStrategy(geocodingRepository),
      [LOCATION_TYPES.COUNTRY_OF_DELIVERY]: new UnknownLocationGeoCodingStrategy(geocodingRepository, this.geocoder),
    };
  }

  private getStrategy(locationType: LOCATION_TYPES): IGeoCodingStrategy {
    switch (locationType) {
      case LOCATION_TYPES.UNKNOWN:
        return new UnknownLocationGeoCodingStrategy(this.geocodingRepository, this.geocoder);
      case LOCATION_TYPES.POINT_OF_PRODUCTION:
        return new PointOfProductionGeocodingStrategy(this.geocodingRepository, this.geocoder);
      case LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT:
        return new AggregationPointGeocodingStrategy(this.geocodingRepository, this.geocoder);
      case LOCATION_TYPES.COUNTRY_OF_PRODUCTION:
        return new CountryOfProductionGeoCodingStrategy(this.geocodingRepository);
      case LOCATION_TYPES.COUNTRY_OF_DELIVERY:
        return new UnknownLocationGeoCodingStrategy(this.geocodingRepository, this.geocoder);
      case LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION:
        return new AdminRegionOfProductionGeocodingStrategy(this.geocodingRepository);
      default:
        throw new Error(`Unknown location type ${locationType}`);
    }
  }

  public async geoCodeSourcingLocation(locationInfo: SourcingLocationInfo): Promise<SourcingLocation> {
    const strategy = this.getStrategy(locationInfo.locationType);
    return await strategy.geoCodeLocation(locationInfo) as SourcingLocation;
  }

  /**
   * Map incoming DTO to our internal LocationInfo shape
   */
  private mapToLocationInfo(location: CreateSourcingLocationV2): SourcingLocationInfo {
    return {
      locationAddressInput: location.locationAddressInput,
      locationLatitude: location.locationLatitude,
      locationLongitude: location.locationLongitude,
      locationAdminRegionInput: location.locationAdminRegionInput,
      locationCountryInput: location.locationCountryInput,
      locationType: location.locationType,
    };
  }

  /**
   * Attempt to retrieve from cache, otherwise execute the appropriate strategy.
   */
  private async lookupOrFetchGeo(locationInfo: SourcingLocationInfo, strategies: Record<LOCATION_TYPES, IGeoCodingStrategy>): Promise<GeoCodedLocation> {
    // 1) Try cache
    const cached = await this.cache.get(locationInfo);

    if (cached) {
      this.logger.debug(`Cache hit for ${locationInfo.locationType}`);
      return cached;
    }

    // 2) Delegate to strategy
    this.logger.debug(`Cache miss. Using ${locationInfo.locationType} strategy`);
    const strategy = strategies[locationInfo.locationType];
    const geoData = await strategy.geoCodeLocation(locationInfo);

    // 3) Save to cache for next time
    await this.cache.set(locationInfo, geoData);
    return geoData;
  }
}
