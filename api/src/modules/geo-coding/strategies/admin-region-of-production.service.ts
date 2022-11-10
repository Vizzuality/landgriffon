import { Injectable } from '@nestjs/common';
import { BaseStrategy } from 'modules/geo-coding/strategies/base-strategy';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { GeoCodingError } from 'modules/geo-coding/errors/geo-coding.error';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';

@Injectable()
export class AdminRegionOfProductionService extends BaseStrategy {
  async geoCodeAdministrativeRegionOfProduction(
    sourcingData: SourcingData,
  ): Promise<SourcingData> {
    // TODO: Since this has become required for all location types, we should validate this at DTO level
    if (!sourcingData.locationCountryInput) {
      throw new GeoCodingError(
        `A Country must be provided for Administrative Region Of Production location type`,
      );
    }
    if (!sourcingData.locationAdminRegionInput) {
      throw new GeoCodingError(
        `An Admin Region must be provided for Administrative Region Of Production location type`,
      );
    }
    if (
      sourcingData.locationAddressInput ||
      sourcingData.locationLatitude ||
      sourcingData.locationLongitude
    ) {
      throw new GeoCodingError(
        `Address and Coordinates should be empty for Administrative Region of Production location type`,
      );
    }

    // 2 locations with the same name can exist within the same country: Palestina, Brazil

    // Ilhas de Martim Vaz  does not exist in GADM, switching to Ishla Trindade

    const parent: { adminRegionId: string; geoRegionId: string } =
      await this.adminRegionService.getAdminRegionAndGeoRegionIdsByAdminRegionName(
        sourcingData.locationCountryInput,
      );

    const descendants: AdminRegion[] =
      await this.adminRegionService.getAdminRegionDescendants(
        [parent.adminRegionId],
        { fullEntities: true },
      );

    const location: AdminRegion | undefined = descendants.find(
      (regions: AdminRegion) =>
        regions.name === sourcingData.locationAdminRegionInput,
    );
    if (!location) {
      throw new GeoCodingError(
        `Admin Region of Production: ${sourcingData.locationAdminRegionInput} is not part of Country: ${sourcingData.locationCountryInput}`,
      );
    }

    const { id: adminRegionId, geoRegionId } =
      await this.adminRegionService.getAdminRegionById(location.id);

    return {
      ...sourcingData,
      adminRegionId,
      geoRegionId,
    };
  }
}
