import { Injectable } from '@nestjs/common';
import { BaseStrategy } from 'modules/geo-coding/strategies/base-strategy';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

@Injectable()
export class CountryOfProductionGeoCodingStrategy extends BaseStrategy {
  async geoCodeCountryOfProduction(
    sourcingData: SourcingData,
  ): Promise<SourcingLocation> {
    /**
     * The user must specify a country, and either address OR coordinates.
     */
    if (!sourcingData.locationCountryInput)
      throw new Error(
        'A country where material is received needs to be provided for Country of Production Location Types',
      );
    if (sourcingData.locationAddressInput && sourcingData.locationLatitude)
      throw new Error(
        'Country of Production Location type must include either an address or coordinates',
      );

    // Since the country received in sourcingData.locationCountryInput is served by the API, we can safely assume that we
    // can get the adminRegion and geoRegion Ids by the AdminRegion name and avoid calling the geocoder
    // We add a level 0 optional search param to ensure we get a Country level response, as we could gate
    // a Admin Region that matches the country name, but its not actually a country

    const { adminRegionId, geoRegionId } =
      await this.adminRegionService.getAdminRegionAndGeoRegionIdsByAdminRegionName(
        sourcingData.locationCountryInput,
        { level: 0 },
      );

    return {
      ...sourcingData,
      adminRegionId,
      geoRegionId,
    } as SourcingLocation;
  }
}
