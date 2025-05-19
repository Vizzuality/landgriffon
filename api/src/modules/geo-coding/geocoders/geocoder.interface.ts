import { GeocodeResult } from '@googlemaps/google-maps-services-js/dist/common';

export const Geocoder: unique symbol = Symbol();

export interface GeocodeArgs {
  address?: string;
  latlng?: string;
}

export interface Geolocation {
  lat: number;
  lng: number;
}

export type CacheKey = GeocodeArgs | Geolocation;

// TODO: remove this google type dependency.
export interface GeocodeResponse {
  results: GeocodeResult[];
}

// TODO: remove this or abstract geocoding from provider?
// export interface GeocoderInterface {
//   geocode(args: GeocodeArgs): Promise<GeocodeResponse>;

//   reverseGeocode(coordinates: {
//     lat: number;
//     lng: number;
//   }): Promise<GeocodeResponse>;
// }
