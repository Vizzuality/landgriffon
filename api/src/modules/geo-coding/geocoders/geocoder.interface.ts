import { GeocodeResult } from '@googlemaps/google-maps-services-js/dist/common';

export interface GeocodeArgs {
  address?: string;
  latlng?: string;
}

// TODO: remove this google type dependency.
export interface GeocodeResponse {
  results: GeocodeResult[];
}

export abstract class GeocoderInterface {
  abstract geocode(args: GeocodeArgs): Promise<GeocodeResponse>;

  abstract reverseGeocode(coordinates: {
    lat: number;
    lng: number;
  }): Promise<GeocodeResponse>;
}
