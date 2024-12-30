import { Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  GeocodeArgs,
  GeocoderInterface,
  GeocodeResponse,
} from 'modules/geo-coding/geocoders/geocoder.interface';
import { Cache } from 'cache-manager';
import { GoogleMapsGeocoder } from 'modules/geo-coding/geocoders/google-maps.geocoder';

export class CacheGeocoder implements GeocoderInterface {
  private logger: Logger = new Logger(CacheGeocoder.name);

  constructor(
    @Inject(GoogleMapsGeocoder) private backendGeocoder: GeocoderInterface,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async geocode(args: GeocodeArgs): Promise<GeocodeResponse> {
    const cacheKey: string = this.generateKeyFromRequest(args);
    const cachedData: GeocodeResponse | undefined = await this.cacheManager.get(
      cacheKey,
    );

    if (cachedData) {
      this.logger.debug(
        `Cache hit for location ${args.address} ${args.latlng}  `,
      );
      return cachedData;
    }

    const data: GeocodeResponse = await this.backendGeocoder.geocode(args);
    this.logger.debug('Set cache for location ' + args.address + args.latlng);
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
