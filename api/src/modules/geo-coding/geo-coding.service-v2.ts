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
import { GeoCodingInterfaceV2 } from './geo-coding-interface';

/**
 * @class SourcingLocationInfo
 * @description Represents the detailed information required for geocoding a sourcing location.
 * It extends {@link CreateSourcingLocationV2} with specific fields crucial for the geocoding process.
 */
export class SourcingLocationInfo extends CreateSourcingLocationV2 {
  locationAddressInput?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  locationAdminRegionInput?: string;
  locationCountryInput: string;
  locationType: LOCATION_TYPES;
}

/**
 * @class GeoCodedLocation
 * @description Represents the result of geocoding a single location, containing administrative and geographic region information.
 */
export class GeoCodedLocation {
  adminRegion: AdminRegion;
  geoRegion: GeoRegion | undefined;
  locationWarning?: string;
}

/**
 * @interface GeoCodeResult
 * @description Represents the overall result of a batch geocoding operation.
 */
export interface GeoCodeResult {
  geocodedSourcingLocations: GeoCodedSourcingLocation[];
  geoCodingErrors: ErrorRecord[];
}

/**
 * @interface ErrorRecord
 * @description Represents a single error encountered during batch processing, typically for a specific row in input data.
 * @internal
 */
interface ErrorRecord {
  row: number;
  error: string;
  type: string;
  sheet: string;
  column: string | null;
}

/**
 * @class GeoCodingServiceV2
 * @description Service responsible for geocoding sourcing locations.
 * It employs a strategy pattern based on `LOCATION_TYPES` to determine the appropriate geocoding logic.
 * Results from geocoding operations are cached to improve performance for repeated requests.
 * All database operations within a single `geocode` call are handled within a transaction.
 */
@Injectable()
export class GeoCodingServiceV2 implements GeoCodingInterfaceV2 {
  private readonly logger = new Logger(GeoCodingServiceV2.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly cache: GeoLocationCacheService,
    private readonly geocoder: CacheGeocoder,
  ) { }

  /**
   * Geocodes a list of sourcing locations.
   * Each location is processed, geocoded according to its type, and saved.
   * Operations are performed within a database transaction.
   *
   * @param {CreateSourcingLocationV2[]} locations - An array of sourcing location data transfer objects to be geocoded.
   * @returns {Promise<GeoCodeResult>} An object containing arrays of successfully geocoded sourcing locations and any errors encountered.
   * @throws {Error} If an unexpected error occurs that prevents the entire batch from being processed (e.g., database connection issue).
   *                 Specific `GeoCodingError` instances for individual locations are collected and returned in the `geoCodingErrors` array.
   */
  async geocode(locations: CreateSourcingLocationV2[]): Promise<GeoCodeResult> {
    const geoCodingErrors: ErrorRecord[] = [];

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    // 1. Start a transaction
    await queryRunner.startTransaction();
    const transactionalEntityManager = queryRunner.manager;
    const strategiesMap = this.initializeStrategies(new GeocodingRepository(transactionalEntityManager));
    const geocodedSourcingLocations: GeoCodedSourcingLocation[] = [];

    try {
      // 2. Process each location
      for (const [index, location] of locations.entries()) {
        this.logger.debug(`Processing row ${index + 1}: ${JSON.stringify(location)}`);

        try {
          const geoData = await this.lookupOrFetchGeo(location, strategiesMap);
          const saved = await transactionalEntityManager.save(SourcingLocation, { ...location, ...geoData });
          geocodedSourcingLocations.push(saved);

        } catch (err: any) {
          this.logger.error(`Error on row ${index + 1}: ${err.message}`, err.stack);

          if (err instanceof GeoCodingError) {
            // Handle GeoCodingError
            this.accumulateGeoCodingErrors(geoCodingErrors, index, err);

          } else {
            // throw unexpected errors
            throw err;
          }
        }
      }

      // 3. Commit the transaction
      await queryRunner.commitTransaction();
      return { geocodedSourcingLocations, geoCodingErrors };

    } catch (err: any) {
      this.logger.error(`Unexpected error during geocoding: ${err.message}`, err.stack);
      // 4. Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      throw err;

    } finally {
      // 5. Release the query runner
      await queryRunner.release();
    }
  }

  private accumulateGeoCodingErrors(geoCodingErrors: ErrorRecord[], index: number, err: GeoCodingError) {
    geoCodingErrors.push({
      row: index + 1,
      error: err.message,
      type: 'geo-coding-error',
      sheet: 'sourcingData',
      column: null,
    });
  }

  /**
   * @private
   * Validates and transforms a {@link CreateSourcingLocationV2} object into a {@link SourcingLocationInfo} object.
   * This method ensures that the location data has all the required fields (e.g., `locationType`, `locationCountryInput`)
   * necessary for geocoding strategies and cache keying.
   * @param {CreateSourcingLocationV2} locationData - The location data to validate/transform.
   * @returns {SourcingLocationInfo} The validated and potentially transformed sourcing location information.
   * @throws {GeoCodingError} If essential fields are missing or invalid.
   */
  private ensureSourcingLocationInfo(locationData: CreateSourcingLocationV2): SourcingLocationInfo {
    // Perform checks to ensure locationData can be safely treated as SourcingLocationInfo
    // This is crucial if SourcingLocationInfo has stricter requirements than CreateSourcingLocationV2
    // (e.g., mandatory fields that might be optional in CreateSourcingLocationV2).
    if (!locationData.locationType || typeof locationData.locationType !== 'string' || !Object.values(LOCATION_TYPES).includes(locationData.locationType as LOCATION_TYPES)) {
      throw new GeoCodingError('Missing or invalid locationType for geocoding.');
    }
    // Assuming locationCountryInput is also vital and comes from CreateSourcingLocationV2
    if (!locationData.locationCountryInput || typeof locationData.locationCountryInput !== 'string') {
      throw new GeoCodingError('Missing or invalid locationCountryInput for geocoding.');
    }
    // If CreateSourcingLocationV2 is structurally compatible with SourcingLocationInfo's requirements,
    // (i.e., all fields SourcingLocationInfo needs are present and correctly typed in CreateSourcingLocationV2),
    // a direct cast can be acceptable, especially if prior validation (e.g., DTO validation) has occurred.
    // However, explicit checks as above are safer.
    return locationData as SourcingLocationInfo;
  }

  /** Instantiate and map each LOCATION_TYPES to its strategy */
  private initializeStrategies(geocodingRepository: GeocodingRepository): Record<LOCATION_TYPES, IGeoCodingStrategy> {
    return {
      [LOCATION_TYPES.UNKNOWN]: new UnknownLocationGeoCodingStrategy(geocodingRepository),
      [LOCATION_TYPES.POINT_OF_PRODUCTION]: new PointOfProductionGeocodingStrategy(geocodingRepository, this.geocoder),
      [LOCATION_TYPES.COUNTRY_OF_PRODUCTION]: new CountryOfProductionGeoCodingStrategy(geocodingRepository),
      [LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT]: new AggregationPointGeocodingStrategy(geocodingRepository, this.geocoder),
      [LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION]: new AdminRegionOfProductionGeocodingStrategy(geocodingRepository),
      [LOCATION_TYPES.COUNTRY_OF_DELIVERY]: new UnknownLocationGeoCodingStrategy(geocodingRepository),
    };
  }

  /**
   * Geocodes a single sourcing location.
   * This is a convenience method that wraps the main {@link geocode} method for a single item.
   *
   * @public
   * @param {SourcingLocationInfo} locationInfo - The detailed information for the sourcing location to be geocoded.
   * @returns {Promise<GeoCodedSourcingLocation>} The geocoded sourcing location.
   * @throws {GeoCodingError} If geocoding fails for the provided location.
   * @throws {Error} If an unexpected error occurs during the process.
   */
  public async geoCodeSourcingLocation(locationInfo: SourcingLocationInfo): Promise<GeoCodedSourcingLocation> {
    const result = await this.geocode([locationInfo]);

    if (result.geoCodingErrors.length > 0) {
      const errorDetails = result.geoCodingErrors[0];
      throw new GeoCodingError(`Geocoding failed for the provided location: ${errorDetails.error} (Row: ${errorDetails.row}, Type: ${errorDetails.type})`);
    }

    if (result.geocodedSourcingLocations.length === 0) {
      // This case should ideally not be reached if there were no geoCodingErrors.
      // It implies a logic issue or an unhandled state in the geocode method for single items.
      throw new Error('Geocoding returned no location and no specific geocoding error.');
    }

    return result.geocodedSourcingLocations[0];
  }

  /**
   * Attempts to retrieve geocoded data from the cache for a given location.
   * If not found in cache, it delegates to the appropriate geocoding strategy based on `locationType`.
   * The result is then stored in the cache for future requests.
   *
   * @private
   * @param {CreateSourcingLocationV2} locationData - The sourcing location data to geocode.
   * @param {Record<LOCATION_TYPES, IGeoCodingStrategy>} strategies - A map of location types to their corresponding geocoding strategies.
   * @returns {Promise<GeoCodedLocation>} The geocoded location data (admin region, geo region).
   */
  private async lookupOrFetchGeo(locationData: CreateSourcingLocationV2, strategies: Record<LOCATION_TYPES, IGeoCodingStrategy>): Promise<GeoCodedLocation> {
    const locationInfo = this.ensureSourcingLocationInfo(locationData);

    // 1) Try cache
    const cached = await this.cache.get(locationInfo);
    const locationType = locationInfo.locationType;

    if (cached) {
      this.logger.debug(`Cache hit for ${locationType}`);
      return cached;
    }

    // 2) Delegate to strategy
    this.logger.debug(`Cache miss. Using ${locationType} strategy`);
    const strategy = strategies[locationType];
    const geoData = await strategy.geoCodeLocation(locationInfo);

    // 3) Save to cache for next time
    await this.cache.set(locationInfo, geoData);
    return geoData;
  }
}
