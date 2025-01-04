import { Injectable } from '@nestjs/common';
import { GoogleMapsGeocoder } from 'modules/geo-coding/geocoders/google-maps.geocoder';
import {
  GeocodeArgs,
  GeocodeResponse,
} from 'modules/geo-coding/geocoders/geocoder.interface';
import { GeocodeResult } from '@googlemaps/google-maps-services-js/dist/common';
import { GeoCodingError } from 'modules/geo-coding/errors/geo-coding.error';
import { AddressComponent } from '@googlemaps/google-maps-services-js';

@Injectable()
export class GeocoderService {
  constructor(private readonly googleMapsGeocoder: GoogleMapsGeocoder) {}

  async geocode(args: GeocodeArgs): Promise<GeocodeResponse> {
    return this.googleMapsGeocoder.geocode(args);
  }

  /**
   ** @description Geocodes address and retrieves most accurate response.
   * Geocoding results have address_components array which contains all parent
   * geographical components, so in order to take most accurate result it takes the
   * one with most elements.
   */
  async geoCodeByAddress(
    locationAddress: string,
    locationCountry: string,
  ): Promise<{
    data: GeocodeResponse;
    warning: string | undefined;
  }> {
    let warning: string | undefined;
    const geocodeResponseData: GeocodeResponse = await this.geocode({
      address: `${locationAddress}, ${locationCountry}`,
    });
    this.validateGeoCodeResponse(
      geocodeResponseData,
      locationAddress,
      locationCountry,
    );

    if (geocodeResponseData.results.length > 1) {
      // Take the most accurate location within the response, and add a warning
      geocodeResponseData.results = [
        geocodeResponseData.results.reduce(
          (prev: GeocodeResult, current: GeocodeResult) => {
            return prev.address_components.length >
              current.address_components.length
              ? prev
              : current;
          },
        ),
      ];
      warning = `${locationAddress},${locationCountry} is ambiguous, taking most accurate interpretation.`;
    }

    return { data: geocodeResponseData, warning };
  }

  /**
   ** @description Validate Geocode response.
   * When address is outside provided country, Geocoding will return
   * several results, one for country and one for address. In case of
   * several countries in result set, raise an error.
   */
  validateGeoCodeResponse(
    geoCodedResponse: GeocodeResponse,
    address: string,
    country: string,
  ): void {
    const countrySet: Set<string> = new Set();
    geoCodedResponse.results.forEach((result: GeocodeResult) => {
      countrySet.add(this.getCountryNameFromGeocodeResult(result));
    });
    if (countrySet.size > 1) {
      throw new GeoCodingError(
        `Address outside provided country: ${address}, ${country}`,
      );
    }
  }

  getCountryNameFromGeocodeResult(geocodeResult: GeocodeResult): string {
    const country: AddressComponent | undefined =
      geocodeResult.address_components.find((address: any) =>
        address.types.includes('country'),
      );
    if (country) return country.long_name;
    throw new Error(`Could not get country`);
  }
}
