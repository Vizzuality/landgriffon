import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  AddressComponent,
  Client,
  ReverseGeocodeRequest,
  Client as ClientType,
  GeocodeRequest,
} from '@googlemaps/google-maps-services-js';
import {
  GeocodeResponse,
  GeocodeResponseData,
} from '@googlemaps/google-maps-services-js/dist/geocode/geocode';
import * as config from 'config';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { GeoRegionsService } from 'modules/geo-regions/geo-regions.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { inspect } from 'util';
import { GeoCodingBaseAbstractService } from 'modules/geo-coding/geo-coding.base.abstract.service';

/**
 * @note: Landgriffon Geocoding strategy doc:
 * https://docs.google.com/document/d/1wjRa6wEnWmDpu0mc54EAwSXwuVtPGhAREtZBWQZID5c/edit#
 */

@Injectable()
export class GeoCodingBaseService extends GeoCodingBaseAbstractService {
  private logger: Logger = new Logger(GeoCodingBaseService.name);
  private readonly client: ClientType;
  private readonly apiKey: string = config.get('geolocation.gmapsApiKey');

  constructor(
    protected readonly adminRegionService: AdminRegionsService,
    protected readonly geoRegionService: GeoRegionsService,
    protected readonly sourcingLocationService: SourcingLocationsService,
  ) {
    super(adminRegionService, geoRegionService, sourcingLocationService);
    this.client = new Client({});
    if (this.apiKey === null) {
      this.logger.warn(
        `Google API key missing. You may experience issues geocoding data.`,
      );
    }
  }

  async geocode(geocodeRequest: GeocodeRequest): Promise<GeocodeResponseData> {
    this.logger.debug('Geocoding');
    let response: GeocodeResponse;
    try {
      response = await this.client.geocode(geocodeRequest);
    } catch (error) {
      this.logger.error(JSON.stringify(inspect(error)));
      throw new UnprocessableEntityException(
        `Google geocoding API request failed. Please make sure that a correct API key is provided`,
      );
    }
    if (!response?.data) {
      throw new UnprocessableEntityException(
        `Google geocoding API request failed. Please make sure that a correct API key is provided`,
      );
    }
    return response.data;
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

  isAddressACountry(locationTypes: string[]): boolean {
    return locationTypes.includes('country');
  }

  isAddressAdminLevel1(locationTypes: string[]): boolean {
    return locationTypes.includes('administrative_area_level_1');
  }

  isAddressAdminLevel2(locationTypes: string[]): boolean {
    return locationTypes.includes('administrative_area_level_2');
  }

  getIsoA2Code(geoCodedResponse: GeocodeResponseData): string {
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
