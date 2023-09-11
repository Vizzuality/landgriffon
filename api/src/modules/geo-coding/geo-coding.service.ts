import { Injectable, Logger } from '@nestjs/common';
import { AggregationPointGeocodingStrategy } from 'modules/geo-coding/strategies/aggregation-point.geocoding.service';
import { PointOfProductionGeocodingStrategy } from 'modules/geo-coding/strategies/point-of-production.geocoding.service';
import { CountryOfProductionGeoCodingStrategy } from 'modules/geo-coding/strategies/country-of-production.geocoding.service';
import { UnknownLocationGeoCodingStrategy } from 'modules/geo-coding/strategies/unknown-location.geocoding.service';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { GeoCodingAbstractClass } from 'modules/geo-coding/geo-coding-abstract-class';
import { AdminRegionOfProductionService } from 'modules/geo-coding/strategies/admin-region-of-production.service';

interface locationInfo {
  locationAddressInput?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  locationAdminRegionInput?: string;
  locationCountryInput: string;
  locationType: LOCATION_TYPES;
}

@Injectable()
export class GeoCodingService extends GeoCodingAbstractClass {
  protected readonly logger: Logger = new Logger(GeoCodingService.name);

  constructor(
    protected readonly aggregationPointGeocodingService: AggregationPointGeocodingStrategy,
    protected readonly pointOfProductionGeocodingService: PointOfProductionGeocodingStrategy,
    protected readonly countryOfProductionService: CountryOfProductionGeoCodingStrategy,
    protected readonly unknownLocationService: UnknownLocationGeoCodingStrategy,
    protected readonly adminRegionOfProductionService: AdminRegionOfProductionService,
  ) {
    super();
  }

  async geoCodeLocations(
    sourcingData: SourcingData[],
  ): Promise<{ geoCodedSourcingData: SourcingData[]; errors: any[] }> {
    this.logger.log(
      `Geocoding locations for ${sourcingData.length} sourcing record elements`,
    );
    const geoCodedSourcingData: SourcingData[] = [];
    const errors: any[] = [];
    for (let i: number = 0; i < sourcingData.length; i++) {
      const location: SourcingData = sourcingData[i];
      this.logger.debug(
        `Geocoding location: Country: ${location.locationCountryInput}, Address: ${location.locationAddressInput}, LAT: ${location.locationLatitude}, LONG: ${location.locationLongitude}`,
      );
      try {
        if (location.locationType === LOCATION_TYPES.UNKNOWN) {
          geoCodedSourcingData.push(
            await this.geoCodeUnknownLocationType(location),
          );
        }
        if (location.locationType === LOCATION_TYPES.COUNTRY_OF_PRODUCTION) {
          geoCodedSourcingData.push(
            await this.geoCodeCountryOfProduction(location),
          );
        }

        if (
          location.locationType === LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT
        ) {
          geoCodedSourcingData.push(
            await this.geoCodeAggregationPoint(location),
          );
        }
        if (location.locationType === LOCATION_TYPES.POINT_OF_PRODUCTION) {
          geoCodedSourcingData.push(
            await this.geoCodePointOfProduction(location),
          );
        }
        if (location.locationType === LOCATION_TYPES.COUNTRY_OF_DELIVERY) {
          geoCodedSourcingData.push(
            await this.geoCodeCountryOfDeliveryLocationType(location),
          );
        }
        if (
          location.locationType ===
          LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION
        ) {
          geoCodedSourcingData.push(
            await this.geoCodeAdminRegionOfProductionLocationType(location),
          );
        }
      } catch (e: any) {
        errors.push({ line: i + 5, error: e.message });
      }
    }

    return { geoCodedSourcingData, errors };
  }

  async geoCodeSourcingLocation(
    locationInfo: locationInfo,
  ): Promise<SourcingLocation> {
    let geoCodedSourcingLocation: Partial<SourcingData> = {};
    if (locationInfo.locationType === LOCATION_TYPES.UNKNOWN) {
      geoCodedSourcingLocation = await this.geoCodeUnknownLocationType(
        locationInfo as SourcingData,
      );
    }
    if (locationInfo.locationType === LOCATION_TYPES.COUNTRY_OF_PRODUCTION) {
      geoCodedSourcingLocation = (await this.geoCodeCountryOfProduction(
        locationInfo as SourcingData,
      )) as SourcingData;
    }

    if (
      locationInfo.locationType === LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT
    ) {
      geoCodedSourcingLocation = (await this.geoCodeAggregationPoint(
        locationInfo as SourcingData,
      )) as SourcingData;
    }
    if (locationInfo.locationType === LOCATION_TYPES.POINT_OF_PRODUCTION) {
      geoCodedSourcingLocation = await this.geoCodePointOfProduction(
        locationInfo as SourcingData,
      );
    }

    if (locationInfo.locationType === LOCATION_TYPES.COUNTRY_OF_DELIVERY) {
      geoCodedSourcingLocation =
        await this.geoCodeCountryOfDeliveryLocationType(
          locationInfo as SourcingData,
        );
    }
    if (
      locationInfo.locationType ===
      LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION
    ) {
      geoCodedSourcingLocation =
        await this.geoCodeAdminRegionOfProductionLocationType(
          locationInfo as SourcingData,
        );
    }
    return geoCodedSourcingLocation as SourcingLocation;
  }

  async geoCodeAggregationPoint(
    sourcingData: SourcingData,
  ): Promise<SourcingData> {
    return this.aggregationPointGeocodingService.geoCodeAggregationPoint(
      sourcingData,
    );
  }

  async geoCodePointOfProduction(
    sourcingData: SourcingData,
  ): Promise<SourcingData> {
    return this.pointOfProductionGeocodingService.geoCodePointOfProduction(
      sourcingData,
    );
  }

  async geoCodeCountryOfProduction(
    sourcingData: SourcingData,
  ): Promise<SourcingData> {
    return this.countryOfProductionService.geoCodeCountryOfProduction(
      sourcingData,
    );
  }

  async geoCodeUnknownLocationType(
    sourcingData: SourcingData,
  ): Promise<SourcingData> {
    return this.unknownLocationService.geoCodeUnknownLocationType(sourcingData);
  }

  /**
   * @description: Due to LG methodology reasons, it is not clear yet how to treat
   *               Country of Delivery location type. For now it will be treated as Unknown
   *               This will be improved in the future so it will require its own logic
   *               as the others
   */

  async geoCodeCountryOfDeliveryLocationType(
    sourcingData: SourcingData,
  ): Promise<SourcingData> {
    return this.unknownLocationService.geoCodeUnknownLocationType(sourcingData);
  }

  async geoCodeAdminRegionOfProductionLocationType(
    sourcingData: SourcingData,
  ): Promise<SourcingData> {
    return this.adminRegionOfProductionService.geoCodeAdministrativeRegionOfProduction(
      sourcingData,
    );
  }
}
