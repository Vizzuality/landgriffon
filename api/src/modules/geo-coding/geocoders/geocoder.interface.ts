import { GeocodeResult } from '@googlemaps/google-maps-services-js/dist/common';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';

export const Geocoder: unique symbol = Symbol();

export interface GeocodeArgs {
  address?: string;
  latlng?: string;
}

// TODO: remove this google type dependency.
export interface GeocodeResponse {
  results: GeocodeResult[];
}

export interface GeocoderInterface {
  geocode(args: GeocodeArgs): Promise<GeocodeResponse>;

  reverseGeocode(coordinates: {
    lat: number;
    lng: number;
  }): Promise<GeocodeResponse>;

  getLocationFromCache(
    sourcingData: SourcingData,
  ): Promise<SourcingData | undefined>;

  setLocationInCache(sourcingData: SourcingData): Promise<SourcingData>;
}
