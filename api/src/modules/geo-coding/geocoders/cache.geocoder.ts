import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { GeocodeResponseData } from '@googlemaps/google-maps-services-js/dist/geocode/geocode';
import { GeocodeArgs } from 'modules/geo-coding/geocoders/geocoder.interface';
import { Cache } from 'cache-manager';
import { GoogleMapsGeocoder } from 'modules/geo-coding/geocoders/google-maps.geocoder';

export const GEOCODING_CACHE_ENABLED: unique symbol = Symbol();

export class CacheGeocoder {
  constructor(
    @Inject(GEOCODING_CACHE_ENABLED) private geocacheEnabled: boolean,
    private backendGeocoder: GoogleMapsGeocoder,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async geocode(args: GeocodeArgs): Promise<GeocodeResponseData> {
    if (!this.geocacheEnabled) {
      return this.backendGeocoder.geocode(args);
    }

    const cacheKey: string = this.generateKeyFromRequest(args);
    const cachedData: GeocodeResponseData | undefined =
      await this.cacheManager.get(cacheKey);

    if (cachedData) return cachedData;
    const data: GeocodeResponseData = await this.backendGeocoder.geocode(args);
    await this.cacheManager.set(cacheKey, data);
    return data;
  }

  // GeocodeRequest has type any since GeocodeRequest doesn't see property 'key'
  generateKeyFromRequest(args: GeocodeArgs): string {
    return Object.values(args).join(':');
  }
}
