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

interface ErrorRecord {
  row: number;
  error: string;
  type: string;
  sheet: string;
  column: string | null;
}

export interface GeoCodeResult {
  geocodedSourcingLocations: GeoCodedSourcingLocation[];
  geoCodingErrors: ErrorRecord[];
}

@Injectable()
export class GeoCodingServiceV2 {
  private readonly logger = new Logger(GeoCodingServiceV2.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly cache: GeoLocationCacheService,
    private readonly geocoder: CacheGeocoder,
  ) { }

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
  private initializeStrategies(repo: GeocodingRepository): Record<LOCATION_TYPES, IGeoCodingStrategy> {
    return {
      [LOCATION_TYPES.UNKNOWN]: new UnknownLocationGeoCodingStrategy(repo, this.geocoder),
      [LOCATION_TYPES.POINT_OF_PRODUCTION]: new PointOfProductionGeocodingStrategy(repo, this.geocoder),
      [LOCATION_TYPES.COUNTRY_OF_PRODUCTION]: new CountryOfProductionGeoCodingStrategy(repo,),
      [LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT]: new AggregationPointGeocodingStrategy(repo, this.geocoder),
      [LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION]: new AdminRegionOfProductionGeocodingStrategy(repo),
      [LOCATION_TYPES.COUNTRY_OF_DELIVERY]: new UnknownLocationGeoCodingStrategy(repo, this.geocoder),
    };
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

  // TODO: GEOCODEING: This method can be improved in performance by initializing just the strategy needed.
  public async geocodeSourcingLocation(locationInfo: SourcingLocationInfo) {
    const repository = new GeocodingRepository(this.dataSource.manager);
    const strategies = this.initializeStrategies(repository);

    try {
      const geoData = await this.lookupOrFetchGeo(locationInfo, strategies);
      const saved = await this.dataSource.manager.save(SourcingLocation, { ...location, ...geoData });

    } catch (err: any) {
      this.logger.error(`Error: ${err.message}`, err.stack);
      throw new GeoCodingError(err.message);
    }
  }
}
