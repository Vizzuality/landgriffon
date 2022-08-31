import { Inject, Injectable } from '@nestjs/common';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { GeoRegionsService } from 'modules/geo-regions/geo-regions.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import {
  GeocodeResponse,
  Geocoder,
  GeocoderInterface,
} from 'modules/geo-coding/geocoders/geocoder.interface';
import { AddressComponent } from '@googlemaps/google-maps-services-js';
import { GeocodeResult } from '@googlemaps/google-maps-services-js/dist/common';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GeoCodingError } from 'modules/geo-coding/errors/geo-coding.error';

/**
 * @note: Landgriffon Geocoding strategy doc:
 * https://docs.google.com/document/d/1wjRa6wEnWmDpu0mc54EAwSXwuVtPGhAREtZBWQZID5c/edit#
 */

@Injectable()
export abstract class BaseStrategy {
  constructor(
    @Inject(Geocoder) protected readonly geocoder: GeocoderInterface,
    protected readonly adminRegionService: AdminRegionsService,
    protected readonly geoRegionService: GeoRegionsService,
    protected readonly sourcingLocationService: SourcingLocationsService,
  ) {}

  async geoCodeByCountry(country: string): Promise<GeocodeResponse> {
    const geocodeResponseData: GeocodeResponse = await this.geocoder.geocode({
      address: `country ${country}`,
    });
    return geocodeResponseData;
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
    const geocodeResponseData: GeocodeResponse = await this.geocoder.geocode({
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

  isAddressACountry(locationTypes: string[]): boolean {
    return locationTypes.includes('country');
  }

  isAddressAdminLevel1(locationTypes: string[]): boolean {
    return locationTypes.includes('administrative_area_level_1');
  }

  isAddressAdminLevel2(locationTypes: string[]): boolean {
    return locationTypes.includes('administrative_area_level_2');
  }

  getIsoA2Code(geoCodedResponse: GeocodeResponse): string {
    // TODO: remove this google type dependency.
    const country: AddressComponent | undefined =
      geoCodedResponse.results[0].address_components.find((address: any) =>
        address.types.includes('country'),
      );
    if (country) return country.short_name;
    throw new Error(`Could not find ISO2 code`);
  }

  getCountryNameFromGeocodeResult(geocodeResult: GeocodeResult): string {
    const country: AddressComponent | undefined =
      geocodeResult.address_components.find((address: any) =>
        address.types.includes('country'),
      );
    if (country) return country.long_name;
    throw new Error(`Could not get country`);
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

  hasBothAddressAndCoordinates(sourcingData: SourcingData): boolean {
    return !!(
      sourcingData.locationAddressInput && sourcingData.locationLatitude
    );
  }

  async findExistingSourcingLocationByGeoRegionId(
    geoRegionId: string,
  ): Promise<SourcingLocation | undefined> {
    return this.sourcingLocationService.findByGeoRegionId(geoRegionId);
  }
}
