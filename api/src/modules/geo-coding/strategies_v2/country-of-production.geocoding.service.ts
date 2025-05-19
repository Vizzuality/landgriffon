import { GeoCodingError } from '../errors/geo-coding.error';
import {
  GeoCodedLocation,
  SourcingLocationInfo,
} from '../geo-coding.service-v2';
import { IGeoCodingStrategy } from './geo-coding.strategy.interface';
import { GeocodingRepository } from './geocoding.repository';

export class CountryOfProductionGeoCodingStrategy implements IGeoCodingStrategy {
  constructor(private geocodingRepository: GeocodingRepository) { }

  async geoCodeLocation(locationInfo: SourcingLocationInfo): Promise<GeoCodedLocation> {
    this.validateLocation(locationInfo);
    // Since the country received in sourcingData.locationCountryInput is served by the API, we can safely assume that
    // we can get the adminRegion and geoRegion by the AdminRegion name and avoid calling the geocoder
    const {
      adminRegion,
      geoRegion
    } = await this.geocodingRepository.getCountryAdminRegionAndGeoRegionByCountryName(locationInfo.locationCountryInput);

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
