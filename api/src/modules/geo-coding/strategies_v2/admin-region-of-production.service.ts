import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { GeoCodingError } from 'modules/geo-coding/errors/geo-coding.error';
import {
  GeoCodedLocation,
  SourcingLocationInfo,
} from '../geo-coding.service-v2';
import { IGeoCodingStrategy } from './geo-coding.strategy.interface';
import { GeocodingRepository } from './geocoding.repository';

export class AdminRegionOfProductionGeocodingStrategy implements IGeoCodingStrategy {
  constructor(private geocodingRepository: GeocodingRepository) { }

  async geoCodeLocation(locationInfo: SourcingLocationInfo): Promise<GeoCodedLocation> {
    this.validateLocation(locationInfo);

    const { locationAdminRegionInput, locationCountryInput } = locationInfo;

    // 2 locations with the same name can exist within the same country: Palestina, Brazil
    // Ilhas de Martim Vaz  does not exist in GADM, switching to Ishla Trindade

    // TODO: GEOCODING this call can be cached by country name

    const {
      adminRegion: parentAdminRegion,
      geoRegion
    } = await this.geocodingRepository.getCountryAdminRegionAndGeoRegionByCountryName(locationCountryInput);

    const adminRegionRepository = this.geocodingRepository.manager.getTreeRepository(AdminRegion);
    const descendants = await adminRegionRepository.manager.getTreeRepository(AdminRegion).findDescendants(parentAdminRegion);

    const location = descendants.find(({ name }) => name === locationAdminRegionInput);

    if (!location) {
      throw new GeoCodingError(
        `Admin Region of Production: ${locationAdminRegionInput} is not part of Country: ${locationCountryInput}`,
      );
    }

    const adminRegion = await adminRegionRepository.findOneOrFail({
      where: { id: location.id },
    });

    return { adminRegion, geoRegion };
  }

  private validateLocation(locationInfo: SourcingLocationInfo): void {
    const {
      locationCountryInput,
      locationAdminRegionInput,
      locationAddressInput,
      locationLatitude,
      locationLongitude
    } = locationInfo;

    // TODO: Since this has become required for all location types, we should validate this at DTO level
    if (!locationCountryInput) {
      throw new GeoCodingError(
        `A Country must be provided for Administrative Region Of Production location type`,
      );
    }

    if (!locationAdminRegionInput) {
      throw new GeoCodingError(
        `An Admin Region must be provided for Administrative Region Of Production location type`,
      );
    }

    if (locationAddressInput || locationLatitude || locationLongitude) {
      throw new GeoCodingError(
        `Address and Coordinates should be empty for Administrative Region of Production location type`,
      );
    }
  }
}
