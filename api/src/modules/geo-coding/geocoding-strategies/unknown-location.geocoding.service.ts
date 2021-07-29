import { Injectable } from '@nestjs/common';
import { GeoCodingBaseService } from 'modules/geo-coding/geo-coding.base.service';
import { SourcingData } from 'modules/import-data/sourcing-records/dto-processor.service';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

@Injectable()
export class UnknownLocationService extends GeoCodingBaseService {
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
    const geoCodedResponse = await this.geoCodeByCountry(
      sourcingData?.locationCountryInput,
    );

    const {
      id: adminRegionId,
      geoRegionId,
    } = await this.adminRegionService.getAdminAndGeoRegionIdByCountryIsoAlpha2(
      geoCodedResponse.results[0]?.address_components?.[0]?.short_name,
    );
    const sourcingLocation = await this.sourcingLocationService.save({
      ...sourcingData,
      adminRegionId,
      geoRegionId,
    });
    return sourcingLocation;
  }
}
