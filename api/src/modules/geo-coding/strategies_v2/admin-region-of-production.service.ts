import { Injectable } from '@nestjs/common';
import { BaseStrategy } from 'modules/geo-coding/strategies/base-strategy';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { GeoCodingError } from 'modules/geo-coding/errors/geo-coding.error';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { IGeoCodingStrategy } from './geo-coding.strategy.interface';
import {
  GeoCodedLocation,
  SourcingLocationInfo,
} from '../geo-coding.service-v2';
import { GeocodingRepository } from './geocoding.repository';

export class AdminRegionOfProductionGeocodingStrategy
  implements IGeoCodingStrategy
{
  repo: GeocodingRepository;

  constructor(geocodingRepository: GeocodingRepository) {
    this.repo = geocodingRepository;
  }

  async geoCodeLocation(
    locationInfo: SourcingLocationInfo,
  ): Promise<GeoCodedLocation> {
    // TODO: Since this has become required for all location types, we should validate this at DTO level
    if (!locationInfo.locationCountryInput) {
      throw new GeoCodingError(
        `A Country must be provided for Administrative Region Of Production location type`,
      );
    }
    if (!locationInfo.locationAdminRegionInput) {
      throw new GeoCodingError(
        `An Admin Region must be provided for Administrative Region Of Production location type`,
      );
    }
    if (
      locationInfo.locationAddressInput ||
      locationInfo.locationLatitude ||
      locationInfo.locationLongitude
    ) {
      throw new GeoCodingError(
        `Address and Coordinates should be empty for Administrative Region of Production location type`,
      );
    }

    // 2 locations with the same name can exist within the same country: Palestina, Brazil

    // Ilhas de Martim Vaz  does not exist in GADM, switching to Ishla Trindade

    const { adminRegion: parentAdminRegion, geoRegion } =
      await this.repo.getCountryAdminRegionAndGeoRegionByCountryName(
        locationInfo.locationCountryInput,
      );

    const adminRegionRepository =
      this.repo.manager.getTreeRepository(AdminRegion);

    const descendants = await adminRegionRepository.manager
      .getTreeRepository(AdminRegion)
      .findDescendants(parentAdminRegion);

    const location: AdminRegion | undefined = descendants.find(
      (regions: AdminRegion) =>
        regions.name === locationInfo.locationAdminRegionInput,
    );
    if (!location) {
      throw new GeoCodingError(
        `Admin Region of Production: ${locationInfo.locationAdminRegionInput} is not part of Country: ${locationInfo.locationCountryInput}`,
      );
    }

    const adminRegion = await adminRegionRepository.findOneOrFail({
      where: { id: location.id },
    });

    return {
      adminRegion,
      geoRegion,
    };
  }
}
