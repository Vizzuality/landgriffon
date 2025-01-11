import { NotFoundException } from '@nestjs/common';
import { IGeoCodingStrategy } from './geo-coding.strategy.interface';
import {
  GeoCodedLocation,
  SourcingLocationInfo,
} from '../geo-coding.service-v2';
import { EntityManager } from 'typeorm';
import { GeocodingRepository } from './geocoding.repository';
import { GeoCodingError } from '../errors/geo-coding.error';

export class CountryOfProductionGeoCodingStrategy
  implements IGeoCodingStrategy
{
  manager: EntityManager;
  repo: GeocodingRepository;

  constructor(geocodingRepository: GeocodingRepository) {
    this.repo = geocodingRepository;
  }

  async geoCodeLocation(
    locationInfo: SourcingLocationInfo,
  ): Promise<GeoCodedLocation> {
    /**
     * The user must specify a country
     */
    if (!locationInfo.locationCountryInput)
      throw new GeoCodingError(
        'A country where material is received needs to be provided for Country of Production Location Types',
      );
    if (locationInfo.locationAddressInput && locationInfo.locationLatitude)
      throw new Error(
        'Country of Production Location type must include either an address or coordinates',
      );

    const { adminRegion, geoRegion } =
      await this.repo.getCountryAdminRegionAndGeoRegionByCountryName(
        locationInfo.locationCountryInput,
      );

    return {
      adminRegion,
      geoRegion,
    };
  }
}
