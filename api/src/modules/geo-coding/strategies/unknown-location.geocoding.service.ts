import { Injectable } from '@nestjs/common';
import { BaseStrategy } from 'modules/geo-coding/strategies/base-strategy';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GeocodeResponse } from 'modules/geo-coding/geocoders/geocoder.interface';

@Injectable()
export class UnknownLocationService extends BaseStrategy {
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
