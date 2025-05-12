import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  GeoCodedLocation,
  SourcingLocationInfo,
} from './geo-coding.service-v2';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheManager {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async setToCache(
    locationInfo: SourcingLocationInfo,
    data: GeoCodedLocation,
  ): Promise<void> {
    const key = this.generateKey(locationInfo);
    await this.cache.set(key, data);
  }

  async getFromCache(
    locationInfo: SourcingLocationInfo,
  ): Promise<GeoCodedLocation | undefined> {
    const key = this.generateKey(locationInfo);
    return this.cache.get(key);
  }

  generateKey(locationInfo: SourcingLocationInfo): string {
    const {
      locationAddressInput = '',
      locationLatitude = '',
      locationLongitude = '',
      locationAdminRegionInput = '',
      locationCountryInput,
      locationType,
    } = locationInfo;
    return [
      locationAddressInput,
      locationLatitude,
      locationLongitude,
      locationAdminRegionInput,
      locationCountryInput,
      locationType,
    ].join('|');
  }
}
