import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { GeocodeRequest } from '@googlemaps/google-maps-services-js';
import { GeocodeResponseData } from '@googlemaps/google-maps-services-js/dist/geocode/geocode';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { GeoRegionsService } from 'modules/geo-regions/geo-regions.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { GeoCodingBaseAbstractService } from 'modules/geo-coding/geo-coding.base.abstract.service';
import { GeoCodingBaseService } from 'modules/geo-coding/geo-coding.base.service';
import { Cache } from 'cache-manager';

/**
 * @note: Landgriffon Geocoding strategy doc:
 * https://docs.google.com/document/d/1wjRa6wEnWmDpu0mc54EAwSXwuVtPGhAREtZBWQZID5c/edit#
 */

@Injectable()
export class GeoCodingCacheableBaseService
  extends GeoCodingBaseService
  implements GeoCodingBaseAbstractService
{
  constructor(
    protected readonly adminRegionService: AdminRegionsService,
    protected readonly geoRegionService: GeoRegionsService,
    protected readonly sourcingLocationService: SourcingLocationsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super(adminRegionService, geoRegionService, sourcingLocationService);
  }

  async geocode(geocodeRequest: GeocodeRequest): Promise<GeocodeResponseData> {
    const cacheKey: string = this.generateKeyFromRequest(geocodeRequest);
    const cachedData: GeocodeResponseData | undefined =
      await this.cacheManager.get(cacheKey);

    if (cachedData) return cachedData;
    const data: GeocodeResponseData = await super.geocode(geocodeRequest);
    await this.cacheManager.set(cacheKey, data);
    return data;
  }

  // GeocodeRequest has type any since GeocodeRequest doesn't see property 'key'
  generateKeyFromRequest(geocodeRequest: any): string {
    const { key, ...params } = geocodeRequest.params;
    return Object.values(params).join(':');
  }
}
