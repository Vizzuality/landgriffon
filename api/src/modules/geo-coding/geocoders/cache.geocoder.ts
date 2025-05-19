// import { Inject, Logger } from '@nestjs/common';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import {
//   GeocodeArgs,
//   GeocodeResponse,
// } from 'modules/geo-coding/geocoders/geocoder.interface';
// import { Cache } from 'cache-manager';
// import { GoogleMapsGeocoder } from 'modules/geo-coding/geocoders/google-maps.geocoder';
// import { GeocodeResult } from '@googlemaps/google-maps-services-js/dist/common';
// import { GeoCodingError } from '../errors/geo-coding.error';
// import { AddressComponent } from '@googlemaps/google-maps-services-js';

// export class CacheGeocoder {
//   private logger: Logger = new Logger(CacheGeocoder.name);

//   constructor(
//     private googleMapsGeocoder: GoogleMapsGeocoder,
//     @Inject(CACHE_MANAGER) private cacheManager: Cache,
//   ) {}

//   async geocode(args: GeocodeArgs): Promise<GeocodeResponse> {
//     const cacheKey = this.generateKeyFromRequest(args);
//     const cachedData: GeocodeResponse | undefined = await this.cacheManager.get(
//       cacheKey,
//     );

//     if (cachedData) {
//       this.logger.debug(
//         `Cache hit for location ${args.address} ${args.latlng}  `,
//       );
//       return cachedData;
//     }

//     const data: GeocodeResponse = await this.googleMapsGeocoder.geocode(args);
//     this.logger.debug('Set cache for location ' + args.address + args.latlng);
//     await this.cacheManager.set(cacheKey, data);
//     return data;
//   }

//   // GeocodeRequest has type any since GeocodeRequest doesn't see property 'key'
//   generateKeyFromRequest(args: GeocodeArgs): string {
//     return Object.values(args).join(':');
//   }

//   async reverseGeocode(coordinates: {
//     lat: number;
//     lng: number;
//   }): Promise<GeocodeResponse> {
//     const cacheKey: string = this.generateKeyFromRequest(
//       coordinates as GeocodeArgs,
//     );
//     const cachedData: GeocodeResponse | undefined = await this.cacheManager.get(
//       cacheKey,
//     );
//     if (cachedData) return cachedData;
//     const data: GeocodeResponse = await this.googleMapsGeocoder.reverseGeocode(
//       coordinates,
//     );
//     await this.cacheManager.set(cacheKey, data);
//     return data;
//   }

//   async geoCodeByCountry(country: string): Promise<GeocodeResponse> {
//     return this.geocode({
//       address: `country ${country}`,
//     });
//   }

//   /**
//    ** @description Geocodes address and retrieves most accurate response.
//    * Geocoding results have address_components array which contains all parent
//    * geographical components, so in order to take most accurate result it takes the
//    * one with most elements.
//    */
//   async geoCodeByAddress(
//     locationAddress: string,
//     locationCountry: string,
//   ): Promise<{
//     data: GeocodeResponse;
//     warning: string | undefined;
//   }> {
//     let warning: string | undefined;
//     const geocodeResponseData: GeocodeResponse = await this.geocode({
//       address: `${locationAddress}, ${locationCountry}`,
//     });
//     this.validateGeoCodeResponse(
//       geocodeResponseData,
//       locationAddress,
//       locationCountry,
//     );

//     if (geocodeResponseData.results.length > 1) {
//       // Take the most accurate location within the response, and add a warning
//       geocodeResponseData.results = [
//         geocodeResponseData.results.reduce(
//           (prev: GeocodeResult, current: GeocodeResult) => {
//             return prev.address_components.length >
//               current.address_components.length
//               ? prev
//               : current;
//           },
//         ),
//       ];
//       warning = `${locationAddress},${locationCountry} is ambiguous, taking most accurate interpretation.`;
//     }

//     return { data: geocodeResponseData, warning };
//   }

//   /**
//    ** @description Validate Geocode response.
//    * When address is outside provided country, Geocoding will return
//    * several results, one for country and one for address. In case of
//    * several countries in result set, raise an error.
//    */
//   validateGeoCodeResponse(
//     geoCodedResponse: GeocodeResponse,
//     address: string,
//     country: string,
//   ): void {
//     const countrySet: Set<string> = new Set();
//     geoCodedResponse.results.forEach((result: GeocodeResult) => {
//       countrySet.add(this.getCountryNameFromGeocodeResult(result));
//     });
//     if (countrySet.size > 1) {
//       throw new GeoCodingError(
//         `Address outside provided country: ${address}, ${country}`,
//       );
//     }
//   }

//   getCountryNameFromGeocodeResult(geocodeResult: GeocodeResult): string {
//     const country: AddressComponent | undefined =
//       geocodeResult.address_components.find((address: any) =>
//         address.types.includes('country'),
//       );
//     if (country) return country.long_name;
//     throw new Error(`Could not get country`);
//   }
// }

import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createHash } from 'crypto';
import {
  CacheKey,
  GeocodeArgs,
  Geolocation,
  GeocodeResponse,
} from 'modules/geo-coding/geocoders/geocoder.interface';
import { GoogleMapsGeocoder } from 'modules/geo-coding/geocoders/google-maps.geocoder';
import { GeocodeResult } from '@googlemaps/google-maps-services-js/dist/common';
import { AddressComponent } from '@googlemaps/google-maps-services-js';
import { GeoCodingError } from '../errors/geo-coding.error';

export const GEOCODER_CACHE_TTL = 'GEOCODER_CACHE_TTL';

@Injectable()
export class CacheGeocoder {
  private readonly logger = new Logger(CacheGeocoder.name);
  private readonly defaultTtl: number;

  constructor(
    private readonly delegate: GoogleMapsGeocoder,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(GEOCODER_CACHE_TTL) @Optional() defaultTtl?: number,
  ) {
    // default to 24 hours
    this.defaultTtl = defaultTtl ?? 24 * 60 * 60;
  }

  /**
   * Geocode an address or lat/lng with cache support
   */
  async geocode(args: CacheKey): Promise<GeocodeResponse> {
    return this.fetchWithCache<GeocodeResponse>(
      args,
      (keyed) => this.delegate.geocode(keyed as GeocodeArgs)
    );
  }

  /**
   * Reverse geocode coordinates with cache support
   */
  async reverseGeocode(coordinates: CacheKey): Promise<GeocodeResponse> {
    // reuse the same cache mechanism by casting
    return this.fetchWithCache<GeocodeResponse>(
      coordinates,
      (keyed) => this.delegate.reverseGeocode(keyed as Geolocation)
    );
  }

  /**
   * Geocode by country only
   */
  async geoCodeByCountry(country: string): Promise<GeocodeResponse> {
    return this.geocode({ address: country });
  }

  /**
   * Geocode by address + country, picking most precise result
   */
  async geoCodeByAddress(address: string, country: string,): Promise<{ data: GeocodeResponse; warning?: string }> {
    const query = `${address}, ${country}`;
    const data = await this.geocode({ address: query });

    this.ensureSameCountry(data, country, address);

    if (data.results.length > 1) {
      const best = this.selectMostPrecise(data.results);
      // TODO: Can we avoid the array and just get the one result we need?
      data.results = [best];
      const warning = `${query} is ambiguous; using most precise result.`;
      this.logger.warn(warning);
      return { data, warning };
    }

    return { data };
  }

  /**
   * Selects the result with the most detailed address (most components).
   */
  private selectMostPrecise(results: GeocodeResult[]): GeocodeResult {
    return results.reduce(
      (prev, curr) =>
        curr.address_components.length > prev.address_components.length
          ? curr
          : prev,
    );
  }

  /**
   * Generic cache lookup/fetch wrapper
   */
  private async fetchWithCache<T>(
    args: CacheKey,
    fetcher: (args: CacheKey) => Promise<T>,
  ): Promise<T> {
    const cacheKey = this.makeCacheKey(args as Record<string, unknown>);

    try {
      const cached = await this.cacheManager.get<T>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit: ${cacheKey}`);
        return cached;
      }

      this.logger.debug(`Cache miss: ${cacheKey}`);
      const data = await fetcher(args);
      await this.cacheManager.set(cacheKey, data, { ttl: this.defaultTtl });
      this.logger.debug(`Cache set: ${cacheKey} (TTL=${this.defaultTtl}s)`);
      return data;

    } catch (err: any) {
      this.logger.error(`Cache error for key ${cacheKey}: ${err.message}`);
      // Fallback to direct fetch on cache errors
      return fetcher(args);
    }
  }

  /**
   * Creates a stable, hashed cache key from request args
   */
  public makeCacheKey(args: Record<string, unknown>): string {
    const sorted = Object.keys(args)
      .sort()
      .reduce<Record<string, unknown>>((obj, key) => {
        obj[key] = args[key];
        return obj;
      }, {});

    const raw = JSON.stringify(sorted);

    // Hash the raw string to create a fixed-length key
    return createHash('sha256')
      .update(raw)
      .digest('hex');
  }

  /**
  * Ensures all returned results belong to the expected country.
  * Throws a GeoCodingError if multiple countries are detected.
  * TODO: This is the same than the one in file:///./geocoder.service.ts
  */
  private ensureSameCountry(
    response: GeocodeResponse,
    country: string,
    addressQuery: string,
  ): void {
    const countries = new Set(
      response.results.map((geocodeResult) => this.extractCountry(geocodeResult)),
    );
    if (countries.size > 1) {
      const msg = `Address outside provided country: ${addressQuery} (expected ${country})`;
      this.logger.error(msg);
      throw new GeoCodingError(msg);
    }
  }

  /**
   * Extracts the country long name from a GeocodeResult.
   * Throws GeoCodingError if no country component is found.
   * TODO: This is the same than the one in file:///./geocoder.service.ts
   */
  private extractCountry(result: GeocodeResult): string {
    const country = result.address_components
      .find((component: AddressComponent) =>
        component.types.some((t) =>
          t === 'country'));

    if (!country) {
      const msg = 'No country component found in geocode result';
      this.logger.error(msg);
      throw new GeoCodingError(msg);
    }

    return country.long_name;
  }
}
