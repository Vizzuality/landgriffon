import { IGeoCodingStrategy } from 'modules/geo-coding/strategies_v2/geo-coding.strategy.interface';

import {
  GeoCodedLocation,
  SourcingLocationInfo,
} from 'modules/geo-coding/geo-coding.service-v2';
import { GeocodingRepository } from 'modules/geo-coding/strategies_v2/geocoding.repository';
import { GeoCodingError } from '../errors/geo-coding.error';
import { CacheGeocoder } from '../geocoders/cache.geocoder';

export class UnknownLocationGeoCodingStrategy implements IGeoCodingStrategy {
  constructor(private geocodingRepository: GeocodingRepository, private geoCoder: CacheGeocoder) { }

  async geoCodeLocation(location: SourcingLocationInfo): Promise<GeoCodedLocation> {
    this.validateLocation(location);
    // Since the country received in sourcingData.locationCountryInput is served by the API, we can safely assume that we
    // can get the adminRegion and geoRegion by the AdminRegion name and avoid calling the geocoder

    // TODO: GEOCODING Cache this as the country name can be used multiple times

    const {
      adminRegion, geoRegion
    } = await this.geocodingRepository.getCountryAdminRegionAndGeoRegionByCountryName(location.locationCountryInput);

    return { adminRegion, geoRegion };
  }

  private validateLocation(location: SourcingLocationInfo): void {
    const {
      locationCountryInput,
      locationAddressInput,
      locationLatitude
    } = location;

    /**
     *   The user must specify a country, but address and coordinates should be empty
     *
     */
    if (!locationCountryInput) {
      throw new GeoCodingError('A country where material is received needs to be provided for Unknown Location Types');
    }

    if (locationAddressInput || locationLatitude) {
      throw new GeoCodingError('Unknown Location type should not include an address or coordinates');
    }
  }
}
