import { Injectable } from '@nestjs/common';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { GeoRegionsService } from 'modules/geo-regions/geo-regions.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { GeocodeResponse } from 'modules/geo-coding/geocoders/geocoder.interface';
import { AddressComponent } from '@googlemaps/google-maps-services-js';
import { GeocodeResult } from '@googlemaps/google-maps-services-js/dist/common';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GeoCodingError } from 'modules/geo-coding/errors/geo-coding.error';
import { CacheGeocoder } from 'modules/geo-coding/geocoders/cache.geocoder';

/**
 * @note: Landgriffon Geocoding strategy doc:
 * https://docs.google.com/document/d/1wjRa6wEnWmDpu0mc54EAwSXwuVtPGhAREtZBWQZID5c/edit#
 */

@Injectable()
export abstract class BaseStrategy {
  constructor(
    protected readonly geocoder: CacheGeocoder,
    protected readonly adminRegionService: AdminRegionsService,
    protected readonly geoRegionService: GeoRegionsService,
    protected readonly sourcingLocationService: SourcingLocationsService,
  ) { }

  async geoCodeByCountry(country: string): Promise<GeocodeResponse> {
    return this.geocoder.geocode({ address: `country ${country}` });
  }

  /**
   ** @description Geocodes address and retrieves most accurate response.
   * Geocoding results have address_components array which contains all parent
   * geographical components, so in order to take most accurate result it takes the
   * one with most elements.
   */
  async geoCodeByAddress(address: string, country: string): Promise<{ data: GeocodeResponse; warning?: string }> {
    let warning: string | undefined;
    const query = `${address}, ${country}`;
    const data = await this.geocoder.geocode({ address: query });

    this.validateGeoCodeResponse(data, country, address);

    if (data.results.length > 1) {
      // Take the most accurate location within the response, and add a warning
      const best = this.selectMostPrecise(data.results);
      data.results = [best];
      warning = `${query} is ambiguous, taking most accurate interpretation.`;
    }

    return { data: data, warning };
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

  // TODO: same as file:///./../geocoders/geocoder.service.ts `extractCountry`
  getCountryNameFromGeocodeResult(result: GeocodeResult): string {
    const country = result.address_components.find(
      (component: AddressComponent) => component.types.some((t) => t === 'country'));
    if (country) return country.long_name;
    throw new Error(`Could not get country`);
  }

  /**
   * TODO: Same as `ensureSameCountry` from file:///./../geocoders/geocoder.service.ts
   *
   ** @description Validate Geocode response.
   * When address is outside provided country, Geocoding will return
   * several results, one for country and one for address. In case of
   * several countries in result set, raise an error.
   */
  validateGeoCodeResponse(
    response: GeocodeResponse,
    country: string,
    addressQuery: string,
  ): void {
    const countrySet: Set<string> = new Set();

    response.results.forEach((result: GeocodeResult) => {
      countrySet.add(this.getCountryNameFromGeocodeResult(result));
    });

    if (countrySet.size > 1) {
      throw new GeoCodingError(
        `Address outside provided country: ${addressQuery}, ${country}`,
      );
    }
  }

  hasBothAddressAndCoordinates(sourcingData: SourcingData): boolean {
    return !!(
      sourcingData.locationAddressInput && sourcingData.locationLatitude
    );
  }

  async findExistingSourcingLocationByGeoRegionId(geoRegionId: string): Promise<SourcingLocation | null> {
    return this.sourcingLocationService.findByGeoRegionId(geoRegionId);
  }
}
