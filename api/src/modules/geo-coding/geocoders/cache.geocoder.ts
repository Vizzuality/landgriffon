import { Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  GeocodeArgs,
  GeocoderInterface,
  GeocodeResponse,
} from 'modules/geo-coding/geocoders/geocoder.interface';
import { Cache } from 'cache-manager';
import { GoogleMapsGeocoder } from 'modules/geo-coding/geocoders/google-maps.geocoder';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';

export const GEOCODING_CACHE_ENABLED: unique symbol = Symbol();

export type LocationInfo = {
  locationAddressInput?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  locationAdminRegionInput?: string;
  locationCountryInput?: string;
  locationType?: string;
};

export class CacheGeocoder implements GeocoderInterface {
  private logger: Logger = new Logger(CacheGeocoder.name);

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

  private async generateDbGeoCodeKey(
    sourcingData: SourcingData,
  ): Promise<string> {
    const {
      locationCountryInput,
      locationType,
      locationLatitude,
      locationLongitude,
      locationAddressInput,
      locationAdminRegionInput,
    } = sourcingData;
    const locationInfo: LocationInfo = {
      locationCountryInput,
      locationType,
      locationLongitude,
      locationLatitude,
      locationAddressInput,
      locationAdminRegionInput,
    };
    return Object.values(locationInfo).join(':').toString();
  }

  async getLocationFromCache(
    sourcingData: SourcingData,
  ): Promise<SourcingData | undefined> {
    const cacheKey: string = await this.generateDbGeoCodeKey(sourcingData);
    const cachedData: SourcingData | undefined = await this.cacheManager.get(
      cacheKey,
    );
    return cachedData;
  }

  async setLocationInCache(sourcingData: SourcingData): Promise<SourcingData> {
    const cacheKey: string = await this.generateDbGeoCodeKey(sourcingData);
    await this.cacheManager.set(cacheKey, sourcingData);
    return sourcingData;
  }
}
