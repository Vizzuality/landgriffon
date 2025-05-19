import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createHash } from 'crypto';
import {
  GeoCodedLocation,
  SourcingLocationInfo,
} from './geo-coding.service-v2';

export const GEO_CACHE_TTL = 'GEO_CACHE_TTL';

@Injectable()
export class GeoLocationCacheService {
  private readonly logger = new Logger(GeoLocationCacheService.name);
  private readonly defaultTtlSeconds: number;

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,

    // Inject a TTL (in seconds); if not provided, fall back to 3600 (1 hour)
    @Inject(GEO_CACHE_TTL)
    @Optional()
    defaultTtlSeconds?: number,
  ) {
    this.defaultTtlSeconds = defaultTtlSeconds ?? 3600;
  }

  /**
   * Stores a GeoCodedLocation in cache.
   *
   * @param locationInfo  the source parameters — used to generate a lookup key
   * @param data          the payload to cache
   * @param ttlSeconds    override default time‑to‑live (in seconds)
   */
  async set(
    locationInfo: SourcingLocationInfo,
    data: GeoCodedLocation,
    ttlSeconds: number = this.defaultTtlSeconds,
  ): Promise<void> {
    const key = this.makeKey(locationInfo);
    try {
      // use the generic overload so it knows what type you’re storing
      await this.cacheManager.set<GeoCodedLocation>(key, data, { ttl: ttlSeconds });
    } catch (err) {
      this.logger.error(`Failed to cache [${key}]`, (err as Error).stack);
    }
  }

  /**
   * Retrieves a GeoCodedLocation from cache if present.
   *
   * @returns the cached value or null if missing / on error
   */
  async get(
    locationInfo: SourcingLocationInfo,
  ): Promise<GeoCodedLocation | null> {
    const key = this.makeKey(locationInfo);
    try {
      const cached = await this.cacheManager.get<GeoCodedLocation>(key);
      return cached ?? null;
    } catch (err) {
      this.logger.error(`Failed to read cache [${key}]`, (err as Error).stack);
      return null;
    }
  }

  // Hashes the concatenated fields into a fixed‑length key
  private makeKey(locationInfo: SourcingLocationInfo): string {
    const {
      locationAddressInput = '',
      locationLatitude = '',
      locationLongitude = '',
      locationAdminRegionInput = '',
      locationCountryInput,
      locationType,
    } = locationInfo;

    const raw = [
      locationAddressInput,
      locationLatitude,
      locationLongitude,
      locationAdminRegionInput,
      locationCountryInput,
      locationType,
    ].join('|');

    // sha256 -> hex, so the keys are always 64 chars
    return createHash('sha256').update(raw).digest('hex');
  }
}
