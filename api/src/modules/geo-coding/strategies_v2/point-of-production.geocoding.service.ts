import { Logger } from '@nestjs/common';

import { IGeoCodingStrategy } from 'modules/geo-coding/strategies_v2/geo-coding.strategy.interface';

import {
  GeoCodedLocation,
  SourcingLocationInfo,
} from 'modules/geo-coding/geo-coding.service-v2';
import { GeoCodingError } from '../errors/geo-coding.error';
import { CacheGeocoder } from '../geocoders/cache.geocoder';
import { GeocodingRepository } from './geocoding.repository';

export class PointOfProductionGeocodingStrategy implements IGeoCodingStrategy {
  private readonly logger: Logger = new Logger(PointOfProductionGeocodingStrategy.name);

  constructor(private geocodingRepository: GeocodingRepository, private geoCoder: CacheGeocoder) { }

  async geoCodeLocation(
    locationInfo: SourcingLocationInfo,
  ): Promise<GeoCodedLocation> {
    const {
      locationCountryInput,
      locationAddressInput,
      locationLatitude,
      locationLongitude,
    } = locationInfo;

    if (!locationCountryInput) {
      const errorMsg = 'A country must be provided for Point of Production location type';
      this.logger.error(errorMsg);
      throw new GeoCodingError(errorMsg);
    }

    if (locationAddressInput && locationLatitude && locationLongitude) {
      const errorMsg = `For ${locationCountryInput} coordinates ${locationLatitude} ,${locationLongitude} and address ${locationAddressInput} has been provided. Either and address or coordinates can be provided for a Point of Production Location Type`;
      this.logger.error(errorMsg);
      throw new GeoCodingError(errorMsg);
    }

    if (locationLongitude && locationLatitude) {
      const [geoRegion, adminRegion] = await Promise.all([
        this.geocodingRepository.saveGeoRegionAsRadius({ locationLatitude, locationLongitude }),
        this.geocodingRepository.getClosestAdminRegionByCoordinates(locationInfo)
      ])

      return { adminRegion, geoRegion };
    }

    if (locationAddressInput && locationCountryInput) {
      const [geoCodeResponseData, geoRegion, adminRegion] = await Promise.all([
        this.geoCoder.geoCodeByAddress(locationAddressInput, locationCountryInput),
        this.geocodingRepository.saveGeoRegionAsPoint(locationInfo),
        this.geocodingRepository.getClosestAdminRegionByCoordinates(locationInfo)
      ])

      return { adminRegion, geoRegion, locationWarning: geoCodeResponseData.warning };
    }

    // Add a fallback error to satisfy TypeScript
    const errorMsg = 'Invalid input: locationInfo must include either coordinates or an address with a country';
    this.logger.error(errorMsg);
    throw new Error(errorMsg);
  }
}
