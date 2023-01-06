import {
  GeocodeResponse,
  GeocodeResponseData,
  GeocodeResult,
  Status,
} from '@googlemaps/google-maps-services-js';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AppModule } from 'app.module';
import { CacheGeocoder } from 'modules/geo-coding/geocoders/cache.geocoder';
import { GoogleMapsGeocoder } from 'modules/geo-coding/geocoders/google-maps.geocoder';
import { Geocoder } from 'modules/geo-coding/geocoders/geocoder.interface';
import { geocodeResponses } from './mocks/geo-coding.mock-response';

describe('GeoCoding Service (Integration Testing)', () => {
  let cacheGeocoder: CacheGeocoder;
  let cacheManager: Cache;

  class GoogleMapsGeocoderMock {
    geocode(): GeocodeResponseData | undefined {
      const response: Partial<GeocodeResponse> = {
        data: {
          results: geocodeResponses[0].results as GeocodeResult[],
          status: Status.OK,
          error_message: 'None',
        },
      };
      return response.data;
    }
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GoogleMapsGeocoder)
      .useClass(GoogleMapsGeocoderMock)
      .compile();

    cacheGeocoder = moduleFixture.get<CacheGeocoder>(Geocoder);
    cacheManager = moduleFixture.get<Cache>(CACHE_MANAGER);
  });

  afterEach(async () => {
    await cacheManager.reset();
  });

  afterAll(async () => {
    jest.clearAllTimers();
  });

  test('Geocoder should use cache', async () => {
    const cacheKey: string = cacheGeocoder.generateKeyFromRequest({
      address: 'Spain',
    });
    const cachedDataBefore: GeocodeResponse | undefined =
      await cacheManager.get(cacheKey);

    const geocodingResult: Partial<GeocodeResponseData> =
      await cacheGeocoder.geocode({
        address: 'Spain',
      });

    const cachedDataAfter: GeocodeResponse | undefined = await cacheManager.get(
      cacheKey,
    );

    expect(cachedDataBefore).toBeFalsy();
    expect(cachedDataAfter).toEqual(geocodingResult);
  });
});
