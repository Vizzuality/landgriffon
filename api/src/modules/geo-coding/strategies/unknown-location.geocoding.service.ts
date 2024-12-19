import { Injectable } from '@nestjs/common';
import { BaseStrategy } from 'modules/geo-coding/strategies/base-strategy';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GeoRegion } from '../../geo-regions/geo-region.entity';
import { AdminRegion } from '../../admin-regions/admin-region.entity';

@Injectable()
export class UnknownLocationGeoCodingStrategy extends BaseStrategy {
  async geoCodeUnknownLocationType(
    sourcingData: SourcingData,
  ): Promise<SourcingLocation> {
    /**
     *   The user must specify a country, but address and coordinates should be empty
     *
     */
    if (!sourcingData.locationCountryInput)
      throw new Error(
        'A country where material is received needs to be provided for Unknown Location Types',
      );
    if (sourcingData.locationAddressInput || sourcingData.locationLatitude)
      throw new Error(
        'Unknown Location type should not include an address or coordinates',
      );
    // Since the country received in sourcingData.locationCountryInput is served by the API, we can safely assume that we
    // can get the adminRegion and geoRegion Ids by the AdminRegion name and avoid calling the geocoder

    const { adminRegionId, geoRegionId } =
      await this.adminRegionService.getAdminRegionAndGeoRegionIdsByAdminRegionName(
        sourcingData.locationCountryInput,
      );
    const geoRegion: GeoRegion = await this.geoRegionService.getById(
      geoRegionId,
    );
    const adminRegion: AdminRegion = await this.adminRegionService.getById(
      adminRegionId,
    );
    return {
      ...sourcingData,
      adminRegionId,
      geoRegionId,
      adminRegion,
      geoRegion,
    } as SourcingLocation;
  }
}
