import { Logger } from '@nestjs/common';

import { GeocodeResponse } from 'modules/geo-coding/geocoders/geocoder.interface';
import { IGeoCodingStrategy } from 'modules/geo-coding/strategies_v2/geo-coding.strategy.interface';

import { EntityManager } from 'typeorm';
import { CacheGeocoder } from 'modules/geo-coding/geocoders/cache.geocoder';
import {
  GeoCodedLocation,
  SourcingLocationInfo,
} from 'modules/geo-coding/geo-coding.service-v2';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { GeocoderService } from '../geocoders/geocoder.service';
import { GeocodingRepository } from './geocoding.repository';

export class PointOfProductionGeocodingStrategy implements IGeoCodingStrategy {
  geocodingRepository: GeocodingRepository;
  geoCoder: GeocoderService;
  logger: Logger = new Logger(PointOfProductionGeocodingStrategy.name);

  constructor(
    geoCodingRepository: GeocodingRepository,
    geoCoder: GeocoderService,
  ) {
    this.geocodingRepository = geoCodingRepository;
    this.geoCoder = geoCoder;
  }

  async geoCodeLocation(
    locationInfo: SourcingLocationInfo,
  ): Promise<GeoCodedLocation> {
    if (!locationInfo.locationCountryInput)
      throw new Error(
        'A country must be provided for Point of Production location type',
      );
    if (
      locationInfo.locationAddressInput &&
      locationInfo.locationLatitude &&
      locationInfo.locationLongitude
    )
      throw new Error(
        `For ${locationInfo.locationCountryInput} coordinates ${locationInfo.locationLatitude} ,${locationInfo.locationLongitude} and address ${locationInfo.locationAddressInput} has been provided. Either and address or coordinates can be provided for a Point of Production Location Type`,
      );

    if (locationInfo.locationLongitude && locationInfo.locationLatitude) {
      const geoRegion: GeoRegion =
        await this.geocodingRepository.saveGeoRegionAsRadius({
          lat: locationInfo.locationLatitude,
          lng: locationInfo.locationLongitude,
        });
      const adminRegion: AdminRegion =
        await this.geocodingRepository.getClosestAdminRegionByCoordinates(
          locationInfo,
        );
      return {
        adminRegion,
        geoRegion,
      };
    }
    if (
      locationInfo.locationAddressInput &&
      locationInfo.locationCountryInput
    ) {
      const geoCodeResponseData: {
        data: GeocodeResponse;
        warning: string | undefined;
      } = await this.geoCoder.geoCodeByAddress(
        locationInfo.locationAddressInput,
        locationInfo.locationCountryInput,
      );
      const geoRegion = await this.geocodingRepository.saveGeoRegionAsPoint(
        locationInfo,
      );
      const adminRegion =
        await this.geocodingRepository.getClosestAdminRegionByCoordinates(
          locationInfo,
        );
      return {
        adminRegion,
        geoRegion,
        locationWarning: geoCodeResponseData.warning,
      };
    }
    // Add a fallback error to satisfy TypeScript
    throw new Error(
      'Invalid input: locationInfo must include either coordinates or an address with a country',
    );
  }
}
