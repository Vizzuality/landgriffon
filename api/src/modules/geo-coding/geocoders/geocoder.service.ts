// import { Injectable } from '@nestjs/common';
// import { GoogleMapsGeocoder } from 'modules/geo-coding/geocoders/google-maps.geocoder';
// import {
//   GeocodeArgs,
//   GeocodeResponse,
// } from 'modules/geo-coding/geocoders/geocoder.interface';
// import { GeocodeResult } from '@googlemaps/google-maps-services-js/dist/common';
// import { GeoCodingError } from 'modules/geo-coding/errors/geo-coding.error';
// import { AddressComponent } from '@googlemaps/google-maps-services-js';

// @Injectable()
// export class GeocoderService {
//   constructor(private readonly googleMapsGeocoder: GoogleMapsGeocoder) {}

//   async geocode(args: GeocodeArgs): Promise<GeocodeResponse> {
//     return this.googleMapsGeocoder.geocode(args);
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


import { Injectable, Logger } from '@nestjs/common';
import { GoogleMapsGeocoder } from 'modules/geo-coding/geocoders/google-maps.geocoder';
import {
  GeocodeArgs,
  GeocodeResponse,
} from 'modules/geo-coding/geocoders/geocoder.interface';
import { GeocodeResult } from '@googlemaps/google-maps-services-js/dist/common';
import { AddressComponent } from '@googlemaps/google-maps-services-js';
import { GeoCodingError } from 'modules/geo-coding/errors/geo-coding.error';

@Injectable()
export class GeocoderService {
  private readonly logger = new Logger(GeocoderService.name);

  constructor(private readonly googleMapsGeocoder: GoogleMapsGeocoder) { }

  /**
   * Delegates to the underlying Google Maps geocoder.
   */
  async geocode(args: GeocodeArgs): Promise<GeocodeResponse> {
    this.logger.debug(`Geocoding request: ${JSON.stringify(args)}`);
    try {
      return await this.googleMapsGeocoder.geocode(args);
    } catch (err) {
      this.logger.error('Geocoding failed', err as Error);
      throw new GeoCodingError('Failed to geocode address');
    }
  }

  /**
   * Geocode by address and country, selecting the most precise result when ambiguous.
   * @returns the geocode response and optional warning if multiple candidates were reduced
   */
  async geoCodeByAddress(address: string, country: string,): Promise<{ data: GeocodeResponse; warning?: string }> {
    const query = `${address}, ${country}`;
    const data = await this.geocode({ address: query });

    this.ensureSameCountry(data, country, address);

    if (data.results.length > 1) {
      const best = this.selectMostPrecise(data.results);
      // TODO: Can we avoid the array and just get the one result we need?
      data.results = [best];
      let warning = `"${query}" is ambiguous; used result with the most address components.`;
      this.logger.warn(warning);
      return { data, warning };
    }

    return { data };
  }

  /**
   * Ensures all returned results belong to the expected country.
   * Throws a GeoCodingError if multiple countries are detected.
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
   * Extracts the country long name from a GeocodeResult.
   * Throws GeoCodingError if no country component is found.
   */
  private extractCountry(result: GeocodeResult): string {
    const country = result.address_components.find(
      (component: AddressComponent) => component.types.some((t) => t === 'country'));

    if (!country) {
      const msg = 'No country component found in geocode result';
      this.logger.error(msg);
      throw new GeoCodingError(msg);
    }

    return country.long_name;
  }
}
