import { Injectable, Logger } from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  QueryFailedError,
  QueryRunner,
} from 'typeorm';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from '../sourcing-locations/sourcing-location.entity';
import { UnknownLocationGeoCodingStrategy } from './strategies_v2/unknown-location.geocoding.service';
import { IGeoCodingStrategy } from './strategies_v2/geo-coding.strategy.interface';
import { BaseStrategy } from './strategies_v2/base-strategy';
import { PointOfProductionGeocodingStrategy } from './strategies_v2/point-of-production.geocoding.service';
import { LocationGeoRegionDto } from 'modules/geo-regions/dto/location.geo-region.dto';
import { AdminRegion } from '../admin-regions/admin-region.entity';
import { GeoRegion } from '../geo-regions/geo-region.entity';
import { CacheGeocoder } from './geocoders/cache.geocoder';
import {
  CreateSourcingLocationV2,
  GeoCodedSourcingLocation,
} from '../sourcing-locations/dto/create-sourcing-location-v2.dto';
import { CacheManager } from './cache.manager';
import { GeocoderService } from './geocoders/geocoder.service';
import { CountryOfProductionGeoCodingStrategy } from './strategies_v2/country-of-production.geocoding.service';
import { GeocodingRepository } from './strategies_v2/geocoding.repository';
import { AdminRegionOfProductionGeocodingStrategy } from './strategies_v2/admin-region-of-production.service';
import { AggregationPointGeocodingStrategy } from './strategies_v2/aggregation-point.geocoding.service';
import { SourcingData } from '../import-data/sourcing-data/dto-processor.service';
import { GeoCodingError } from './errors/geo-coding.error';

/**
 * @description: Custom repository for GeoCoding that handles all queries in a single transaction, due to changes in typeorm 0.2.x, not allowing
 * to use class-based custom repositories to be retrieved by the datasource:
 * see: https://github.com/typeorm/typeorm/issues/9013
 */

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

@Injectable()
export class GeoCodingServiceV2 {
  queryRunner: QueryRunner | null;
  manager: EntityManager;
  strategies: Record<LOCATION_TYPES, IGeoCodingStrategy>;
  logger: Logger = new Logger(GeoCodingServiceV2.name);
  geocodingErrors: any[] = [];

  constructor(
    private readonly dataSource: DataSource,
    private readonly cacheManager: CacheManager,
    private readonly geocoder: GeocoderService,
  ) {}

  async geocode(locations: CreateSourcingLocationV2[]): Promise<{
    geocodedSourcingLocations: GeoCodedSourcingLocation[];
    geoCodingErrors: any[];
  }> {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
    this.manager = this.queryRunner.manager;
    this.loadStrategies(new GeocodingRepository(this.manager));
    const geocodedSourcingLocations: GeoCodedSourcingLocation[] = [];
    try {
      for (let index = 0; index < locations.length; index++) {
        const location = locations[index];
        try {
          const { adminRegion, geoRegion, locationWarning } =
            await this.geocodeLocation(location);
          await this.saveSourcingLocation({
            ...location,
            adminRegion,
            geoRegion,
            locationWarning,
          });
        } catch (e: any) {
          this.logger.error(
            `Error geocoding location ${JSON.stringify(location)}: ${
              e.message
            }`,
            e.stack,
          );
          if (e instanceof GeoCodingError) {
            this.accumulateGeocodingErrors(e, index);
          }
          if (e instanceof QueryFailedError) {
            await this.queryRunner.rollbackTransaction();
            await this.queryRunner.release();
            throw e;
          }
        }
      }
      await this.queryRunner.commitTransaction();
      return {
        geocodedSourcingLocations,
        geoCodingErrors: this.geocodingErrors,
      };
    } catch (e: any) {
      this.logger.error(
        `Unexpected error during geocoding: ${e.message}`,
        e.stack,
      );
      await this.queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await this.queryRunner.release();
    }
  }

  private loadStrategies(repository: GeocodingRepository): void {
    const unknownLocationStrategy = new UnknownLocationGeoCodingStrategy(
      repository,
    );
    const pointOfProductionStrategy = new PointOfProductionGeocodingStrategy(
      repository,
      this.geocoder,
    );
    const countryOfProductionStrategy =
      new CountryOfProductionGeoCodingStrategy(repository);
    const aggregationPointStrategy = new AggregationPointGeocodingStrategy(
      repository,
      this.geocoder,
    );
    const adminRegionOfProductionStrategy =
      new AdminRegionOfProductionGeocodingStrategy(repository);

    this.strategies = {
      [LOCATION_TYPES.UNKNOWN]: unknownLocationStrategy,
      [LOCATION_TYPES.POINT_OF_PRODUCTION]: pointOfProductionStrategy,
      [LOCATION_TYPES.COUNTRY_OF_PRODUCTION]: countryOfProductionStrategy,
      [LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT]: aggregationPointStrategy,
      [LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION]:
        adminRegionOfProductionStrategy,
      [LOCATION_TYPES.COUNTRY_OF_DELIVERY]: unknownLocationStrategy,
    };
  }

  private async geocodeLocation(
    location: CreateSourcingLocationV2,
  ): Promise<GeoCodedLocation> {
    const locationInfo = this.getLocationInfo(location);
    this.logger.log(`Geocoding location: ${JSON.stringify(locationInfo)}`);
    const cachedLocation = await this.cacheManager.getFromCache(locationInfo);
    if (cachedLocation) {
      this.logger.log(
        `Location found in cache: Admin Region ${JSON.stringify(
          cachedLocation.adminRegion.id,
        )} and Geo Region ${JSON.stringify(cachedLocation.geoRegion.id)}`,
      );
      return cachedLocation;
    }
    const strategy = this.strategies[locationInfo.locationType];
    this.logger.log(`Cache not found. Geocoding location...`);
    const geocodedLocation: GeoCodedLocation = await strategy.geoCodeLocation(
      locationInfo,
    );
    await this.cacheManager.setToCache(locationInfo, geocodedLocation);
    return geocodedLocation;
  }

  private getLocationInfo(
    location: CreateSourcingLocationV2,
  ): SourcingLocationInfo {
    return {
      locationAddressInput: location.locationAddressInput,
      locationLatitude: location.locationLatitude,
      locationLongitude: location.locationLongitude,
      locationAdminRegionInput: location.locationAdminRegionInput,
      locationCountryInput: location.locationCountryInput,
      locationType: location.locationType,
    };
  }

  private async saveSourcingLocation(
    sourcingLocation: GeoCodedSourcingLocation,
  ): Promise<SourcingLocation> {
    return this.manager.save(SourcingLocation, sourcingLocation);
  }

  private accumulateGeocodingErrors(
    error: GeoCodingError,
    count: number,
  ): void {
    this.geocodingErrors.push({
      row: count + 5,
      error: error.message,
      type: 'geo-coding-error',
      sheet: 'sourcingData',
      column: null,
    });
  }
}
