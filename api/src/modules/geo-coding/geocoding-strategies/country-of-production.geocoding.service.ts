import { Injectable } from '@nestjs/common';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GeocodeResponseData } from '@googlemaps/google-maps-services-js/dist/geocode/geocode';
import { GeoCodingCacheableBaseService } from 'modules/geo-coding/geo-coding-cacheable.base.service';
import { GeoCodingBaseAbstractService } from 'modules/geo-coding/geo-coding.base.abstract.service';

@Injectable()
export class CountryOfProductionService
  extends GeoCodingCacheableBaseService
  implements GeoCodingBaseAbstractService
{
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

    const geoCodedResponse: GeocodeResponseData = await this.geoCodeByCountry(
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
