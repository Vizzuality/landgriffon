import { Injectable, Logger } from '@nestjs/common';
import { AdminRegionOfProductionService } from 'modules/geo-coding/strategies/admin-region-of-production.service';
import { AggregationPointGeocodingStrategy } from 'modules/geo-coding/strategies/aggregation-point.geocoding.service';
import { CountryOfProductionGeoCodingStrategy } from 'modules/geo-coding/strategies/country-of-production.geocoding.service';
import { PointOfProductionGeocodingStrategy } from 'modules/geo-coding/strategies/point-of-production.geocoding.service';
import { UnknownLocationGeoCodingStrategy } from 'modules/geo-coding/strategies/unknown-location.geocoding.service';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { ImportProgressTrackerFactory } from '../events/import-data-progress/import-progress.tracker.factory';
import { GeoCodingInterface } from './geo-coding-interface';

interface LocationInfo {
  locationAddressInput?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  locationAdminRegionInput?: string;
  locationCountryInput: string;
  locationType: LOCATION_TYPES;
}

@Injectable()
export class GeoCodingService implements GeoCodingInterface {
  protected readonly logger: Logger = new Logger(GeoCodingService.name);

  constructor(
    protected readonly aggregationPointGeocodingService: AggregationPointGeocodingStrategy,
    protected readonly pointOfProductionGeocodingService: PointOfProductionGeocodingStrategy,
    protected readonly countryOfProductionService: CountryOfProductionGeoCodingStrategy,
    protected readonly unknownLocationService: UnknownLocationGeoCodingStrategy,
    protected readonly adminRegionOfProductionService: AdminRegionOfProductionService,
    protected readonly progressTrackerFactory: ImportProgressTrackerFactory,
  ) { }

  async geoCodeLocations(sourcingData: SourcingData[]): Promise<{ geoCodedSourcingData: SourcingData[]; errors: any[] }> {
    this.logger.log(`Geocoding locations for ${sourcingData.length} sourcing record elements`);

    const geoCodedSourcingData: SourcingData[] = [];
    const errors: any[] = [];
    const totalLocations = sourcingData.length;
    const progressTracker = this.progressTrackerFactory.createGeoCodingTracker({ totalLocations });

    for (let i: number = 0; i < totalLocations; i++) {
      const location: SourcingData = sourcingData[i];
      this.logger.debug(
        `Geocoding location: Country: ${location.locationCountryInput}, Address: ${location.locationAddressInput}, LAT: ${location.locationLatitude}, LONG: ${location.locationLongitude}`,
      );

      try {
        switch (location.locationType) {
          case LOCATION_TYPES.UNKNOWN:
            geoCodedSourcingData.push(await this.geoCodeUnknownLocationType(location));
            break;
          case LOCATION_TYPES.COUNTRY_OF_PRODUCTION:
            geoCodedSourcingData.push(await this.geoCodeCountryOfProduction(location));
            break;
          case LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT:
            geoCodedSourcingData.push(await this.geoCodeAggregationPoint(location));
            break;
          case LOCATION_TYPES.POINT_OF_PRODUCTION:
            geoCodedSourcingData.push(await this.geoCodePointOfProduction(location));
            break;
          case LOCATION_TYPES.COUNTRY_OF_DELIVERY:
            geoCodedSourcingData.push(await this.geoCodeCountryOfDeliveryLocationType(location));
            break;
          case LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION:
            geoCodedSourcingData.push(await this.geoCodeAdminRegionOfProductionLocationType(location));
            break;
          default:
            break;
        }

        progressTracker.trackProgress();

      } catch (e: any) {
        errors.push({
          row: i + 5,
          error: e.message,
          type: 'geo-coding-error',
          sheet: 'sourcingData',
          column: null,
        });
        progressTracker.trackProgress();
      }
    }

    return { geoCodedSourcingData, errors };
  }

  async geoCodeSourcingLocation(locationInfo: LocationInfo): Promise<SourcingLocation> {
    switch (locationInfo.locationType) {
      case LOCATION_TYPES.UNKNOWN:
        return await this.geoCodeUnknownLocationType(locationInfo as SourcingData) as SourcingLocation;
      case LOCATION_TYPES.COUNTRY_OF_PRODUCTION:
        return await this.geoCodeCountryOfProduction(locationInfo as SourcingData) as SourcingLocation;
      case LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT:
        return await this.geoCodeAggregationPoint(locationInfo as SourcingData) as SourcingLocation;
      case LOCATION_TYPES.POINT_OF_PRODUCTION:
        return await this.geoCodePointOfProduction(locationInfo as SourcingData) as SourcingLocation;
      case LOCATION_TYPES.COUNTRY_OF_DELIVERY:
        return await this.geoCodeCountryOfDeliveryLocationType(locationInfo as SourcingData) as SourcingLocation;
      case LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION:
        return await this.geoCodeAdminRegionOfProductionLocationType(locationInfo as SourcingData) as SourcingLocation;
      default:
        return {} as SourcingLocation;
    }
  }

  async geoCodeAggregationPoint(sourcingData: SourcingData,): Promise<SourcingData> {
    return this.aggregationPointGeocodingService.geoCodeAggregationPoint(sourcingData);
  }

  async geoCodePointOfProduction(sourcingData: SourcingData,): Promise<SourcingData> {
    return this.pointOfProductionGeocodingService.geoCodePointOfProduction(sourcingData,);
  }

  async geoCodeCountryOfProduction(sourcingData: SourcingData,): Promise<SourcingData> {
    return this.countryOfProductionService.geoCodeCountryOfProduction(sourcingData,);
  }

  async geoCodeUnknownLocationType(sourcingData: SourcingData,): Promise<SourcingData> {
    return this.unknownLocationService.geoCodeUnknownLocationType(sourcingData);
  }

  /**
   * @description: Due to LG methodology reasons, it is not clear yet how to treat
   *               Country of Delivery location type. For now it will be treated as Unknown
   *               This will be improved in the future so it will require its own logic
   *               as the others
   */

  async geoCodeCountryOfDeliveryLocationType(sourcingData: SourcingData,): Promise<SourcingData> {
    return this.unknownLocationService.geoCodeUnknownLocationType(sourcingData);
  }

  async geoCodeAdminRegionOfProductionLocationType(sourcingData: SourcingData,): Promise<SourcingData> {
    return this.adminRegionOfProductionService.geoCodeAdministrativeRegionOfProduction(sourcingData);
  }
}
