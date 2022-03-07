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

  async geoCodeByAddress(locationAddress: string): Promise<GeocodeResponse> {
    const geocodeResponseData: GeocodeResponse = await this.geocoder.geocode({
      address: locationAddress,
    });
    return geocodeResponseData;
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

  hasBothAddressAndCoordinates(sourcingData: SourcingData): boolean {
    return !!(
      sourcingData.locationAddressInput && sourcingData.locationLatitude
    );
  }
}
