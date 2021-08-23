import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  AddressComponent,
  Client,
  ReverseGeocodeRequest,
} from '@googlemaps/google-maps-services-js';
import {
  Client as ClientType,
  GeocodeRequest,
} from '@googlemaps/google-maps-services-js/dist/client';

import { GeocodeResponseData } from '@googlemaps/google-maps-services-js/dist/geocode/geocode';
import * as config from 'config';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';

import { GeoRegionsService } from 'modules/geo-regions/geo-regions.service';

import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';

/**
 * @note: Landgriffon Geocoding strategy doc:
 * https://docs.google.com/document/d/1wjRa6wEnWmDpu0mc54EAwSXwuVtPGhAREtZBWQZID5c/edit#
 */

@Injectable()
export class GeoCodingBaseService {
  private logger: Logger = new Logger(GeoCodingBaseService.name);
  private readonly client: ClientType;
  private readonly apiKey: string = config.get('geocoding.gmapsApiKey');

  constructor(
    protected readonly adminRegionService: AdminRegionsService,
    protected readonly geoRegionService: GeoRegionsService,
    protected readonly sourcingLocationService: SourcingLocationsService,
  ) {
    this.client = new Client({});
  }

  async geocode(geocodeRequest: GeocodeRequest): Promise<GeocodeResponseData> {
    const res = await this.client.geocode(geocodeRequest);
    if (!res.data) {
      throw new UnprocessableEntityException(
        "Google maps API doesn't work. Please, make sure," +
          ' that a correct KEY is set in GMAPS_API_KEY',
      );
    }
    return res.data;
  }

  async reverseGeocode(coordinates: {
    lat: number;
    lng: number;
  }): Promise<GeocodeResponseData> {
    const geocodeRequest: ReverseGeocodeRequest = {
      params: {
        latlng: `${coordinates.lat},${coordinates.lng}`,
        key: this.apiKey,
      },
    };

    const geocodeResponseData: GeocodeResponseData = await this.geocode(
      geocodeRequest,
    );

    return geocodeResponseData;
  }

  async geoCodeByCountry(country: string): Promise<GeocodeResponseData> {
    const geocodeRequest: GeocodeRequest = {
      params: {
        address: `country ${country}`,
        key: this.apiKey,
      },
    };

    const geocodeResponseData: GeocodeResponseData = await this.geocode(
      geocodeRequest,
    );
    return geocodeResponseData;
  }

  async geoCodeByAddress(
    locationAddress: string,
  ): Promise<GeocodeResponseData> {
    const geocodeRequest: GeocodeRequest = {
      params: {
        address: locationAddress,
        key: this.apiKey,
      },
    };
    const geocodeResponseData: GeocodeResponseData = await this.geocode(
      geocodeRequest,
    );
    return geocodeResponseData;
  }

  isAddressAContry(locationTypes: string[]): boolean {
    return locationTypes.includes('country');
  }

  isAddressAdminLevel1(locationTypes: string[]): boolean {
    return locationTypes.includes('administrative_area_level_1');
  }

  getIsoA2Code(geoCodedResponse: GeocodeResponseData): string | void {
    const country:
      | AddressComponent
      | undefined = geoCodedResponse.results[0].address_components.find(
      (address: any) => address.types.includes('country'),
    );
    if (country) return country.short_name;
  }

  hasBothAddressAndCoordinates(sourcingData: SourcingData): boolean {
    return !!(
      sourcingData.locationAddressInput && sourcingData.locationLatitude
    );
  }
}
