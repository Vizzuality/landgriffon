import { Injectable } from '@nestjs/common';
import { BaseStrategy } from 'modules/geo-coding/strategies/base-strategy';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GeocodeResponse } from 'modules/geo-coding/geocoders/geocoder.interface';

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

    // Geo-code country to get short_name property which matches isoA2 when location is a country
    // Find admin-region and geo-region ids via isoA2Alpha code

    const geoCodedResponse: GeocodeResponse = await this.geoCodeByCountry(
      sourcingData?.locationCountryInput,
    );

    const { id: adminRegionId, geoRegionId } =
      await this.adminRegionService.getAdminAndGeoRegionIdByCountryIsoAlpha2(
        geoCodedResponse.results[0]?.address_components?.[0]?.short_name,
      );
    return {
      ...sourcingData,
      adminRegionId,
      geoRegionId,
    } as SourcingLocation;
  }
}
