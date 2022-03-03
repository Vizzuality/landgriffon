import {
  GeocodeResponse,
  LocationType,
  Status,
} from '@googlemaps/google-maps-services-js';

export const googleMapsGeocoderResponseMock: Partial<GeocodeResponse> = {
  data: {
    results: [
      {
        address_components: [
          {
            long_name: 'Spain',
            short_name: 'ESP',
            types: [],
          },
        ],
        formatted_address: 'Spain',
        geometry: {
          location: {
            lat: 37.4224428,
            lng: -122.0842467,
          },
          location_type: LocationType.ROOFTOP,
          viewport: {
            northeast: {
              lat: 37.4239627802915,
              lng: -122.0829089197085,
            },
            southwest: {
              lat: 37.4212648197085,
              lng: -122.0856068802915,
            },
          },
          bounds: {
            northeast: {
              lat: 37.4224428,
              lng: -122.0842467,
            },
            southwest: {
              lat: 37.4224428,
              lng: -122.0842467,
            },
          },
        },
        place_id: 'ChIJeRpOeF67j4AR9ydy_PIzPuM',
        plus_code: {
          compound_code: 'CWC8+X8 Mountain View, CA',
          global_code: '849VCWC8+X8',
        },
        types: [],
        postcode_localities: ['test'],
        partial_match: false,
      },
    ],
    status: Status.OK,
    error_message: 'None',
  },
};
