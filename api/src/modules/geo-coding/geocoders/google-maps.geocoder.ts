import { Logger, UnprocessableEntityException } from '@nestjs/common';
import { Client as ClientType } from '@googlemaps/google-maps-services-js/dist/client';
import * as config from 'config';
import { Client, GeocodeRequest } from '@googlemaps/google-maps-services-js';
import {
  GeocodeResponse,
  GeocodeResponseData,
} from '@googlemaps/google-maps-services-js/dist/geocode/geocode';
import { inspect } from 'util';
import {
  GeocodeArgs,
  GeocoderInterface,
} from 'modules/geo-coding/geocoders/geocoder.interface';
import { GeoCodingError } from 'modules/geo-coding/errors/geo-coding.error';

export class GoogleMapsGeocoder implements GeocoderInterface {
  private logger: Logger = new Logger(GoogleMapsGeocoder.name);
  private readonly client: ClientType;
  private readonly apiKey: string = config.get('geolocation.gmapsApiKey');

  constructor() {
    this.client = new Client({});
    if (this.apiKey === null) {
      this.logger.warn(
        `Google API key missing. You may experience issues geocoding data.`,
      );
    }
  }

  async geocode(args: GeocodeArgs): Promise<GeocodeResponseData> {
    this.logger.debug('Geocoding');
    let response: GeocodeResponse;

    const geocodeRequest: GeocodeRequest = {
      params: {
        ...args,
        key: this.apiKey,
      },
    };
    try {
      response = await this.client.geocode(geocodeRequest);
    } catch (error) {
      this.logger.error(JSON.stringify(inspect(error)));
      throw new UnprocessableEntityException(
        `Google geocoding API request failed. Please make sure that a correct API key is provided`,
      );
    }

    if (!response.data.results.length) {
      throw new GeoCodingError(
        `Could not GeoLocate new Location by address: ${args.address}. Please make sure your Address info is correct`,
      );
    }
    return response.data;
  }

  async reverseGeocode(coordinates: {
    lat: number;
    lng: number;
  }): Promise<GeocodeResponseData> {
    const geocodeRequest: GeocodeArgs = {
      latlng: `${coordinates.lat},${coordinates.lng}`,
    };
    const geocodeResponseData: GeocodeResponseData = await this.geocode(
      geocodeRequest,
    );

    if (!geocodeResponseData.results.length) {
      throw new GeoCodingError(
        `Could not GeoLocate new Location by Coordinates Latitude ${coordinates.lat} and Longitude: ${coordinates.lng}. Please make sure your Location info is correct`,
      );
    }
    return geocodeResponseData;
  }
}
