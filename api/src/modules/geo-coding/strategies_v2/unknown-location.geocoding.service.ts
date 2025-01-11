import { EntityManager } from 'typeorm';
import { IGeoCodingStrategy } from 'modules/geo-coding/strategies_v2/geo-coding.strategy.interface';

import {
  GeoCodedLocation,
  SourcingLocationInfo,
} from 'modules/geo-coding/geo-coding.service-v2';
import { GeocodingRepository } from 'modules/geo-coding/strategies_v2/geocoding.repository';
import { GeoCodingError } from '../errors/geo-coding.error';

export class UnknownLocationGeoCodingStrategy implements IGeoCodingStrategy {
  manager: EntityManager;
  repo: GeocodingRepository;

  constructor(geocodingRepository: GeocodingRepository) {
    this.repo = geocodingRepository;
  }

  async geoCodeLocation(
    location: SourcingLocationInfo,
  ): Promise<GeoCodedLocation> {
    /**
     *   The user must specify a country, but address and coordinates should be empty
     *
     */
    if (!location.locationCountryInput)
      throw new GeoCodingError(
        'A country where material is received needs to be provided for Unknown Location Types',
      );
    if (location.locationAddressInput || location.locationLatitude)
      throw new GeoCodingError(
        'Unknown Location type should not include an address or coordinates',
      );
    // Since the country received in sourcingData.locationCountryInput is served by the API, we can safely assume that we
    // can get the adminRegion and geoRegion by the AdminRegion name and avoid calling the geocoder

    const countryName = location.locationCountryInput;
    const { adminRegion, geoRegion } =
      await this.repo.getCountryAdminRegionAndGeoRegionByCountryName(
        countryName,
      );

    return {
      adminRegion,
      geoRegion,
    };
  }
}
