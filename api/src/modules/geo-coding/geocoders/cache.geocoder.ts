import { CACHE_MANAGER, Inject } from '@nestjs/common';
import {
  GeocodeArgs,
  GeocoderInterface,
  GeocodeResponse,
} from 'modules/geo-coding/geocoders/geocoder.interface';
import { Cache } from 'cache-manager';
import { GoogleMapsGeocoder } from 'modules/geo-coding/geocoders/google-maps.geocoder';

export const GEOCODING_CACHE_ENABLED: unique symbol = Symbol();

export class CacheGeocoder implements GeocoderInterface {
  constructor(
    @Inject(GEOCODING_CACHE_ENABLED) private geocacheEnabled: boolean,
    @Inject(GoogleMapsGeocoder) private backendGeocoder: GeocoderInterface,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async geocode(args: GeocodeArgs): Promise<GeocodeResponse> {
    if (!this.geocacheEnabled) {
      return this.backendGeocoder.geocode(args);
    }

    const cacheKey: string = this.generateKeyFromRequest(args);
    const cachedData: GeocodeResponse | undefined = await this.cacheManager.get(
      cacheKey,
    );

    if (cachedData) return cachedData;
    const data: GeocodeResponse = await this.backendGeocoder.geocode(args);
    await this.cacheManager.set(cacheKey, data);
    return data;
  }

  // GeocodeRequest has type any since GeocodeRequest doesn't see property 'key'
  generateKeyFromRequest(args: GeocodeArgs): string {
    return Object.values(args).join(':');
  }

  async reverseGeocode(coordinates: {
    lat: number;
    lng: number;
  }): Promise<GeocodeResponse> {
    if (!this.geocacheEnabled) {
      return this.backendGeocoder.reverseGeocode(coordinates);
    }
    const cacheKey: string = this.generateKeyFromRequest(
      coordinates as GeocodeArgs,
    );
    const cachedData: GeocodeResponse | undefined = await this.cacheManager.get(
      cacheKey,
    );
    if (cachedData) return cachedData;
    const data: GeocodeResponse = await this.backendGeocoder.reverseGeocode(
      coordinates,
    );
    await this.cacheManager.set(cacheKey, data);
    return data;
  }
}
