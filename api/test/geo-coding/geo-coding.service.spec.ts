import { INestApplication } from '@nestjs/common';

import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { GeoCodingModule } from '../../src/modules/geo-coding/geo-coding.module';
import { GeoCodingService } from '../../src/modules/geo-coding/geo-coding.service';
import { GeoCodingBaseService } from '../../src/modules/geo-coding/geo-coding.base.service';
import { SourcingData } from '../../src/modules/import-data/sourcing-records/dto-processor.service';
import { AdminRegionsService } from '../../src/modules/admin-regions/admin-regions.service';
import { AdminRegion } from '../../src/modules/admin-regions/admin-region.entity';
import { GeoRegionRepository } from '../../src/modules/geo-regions/geo-region.repository';
import { SourcingLocationsService } from '../../src/modules/sourcing-locations/sourcing-locations.service';
import { SourcingLocation } from '../../src/modules/sourcing-locations/sourcing-location.entity';
import { AggregationPointGeocodingService } from '../../src/modules/geo-coding/geocoding-strategies/aggregation-point.geocoding.service';
import { geocodeResponses } from './mocks/geo-coding.mock-response';
import { GeocodeResponseData } from '@googlemaps/google-maps-services-js/dist/geocode/geocode';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('GeoCoding Service (Integration Testing)', () => {
  let app: INestApplication;
  let geoCodingService: GeoCodingService;
  let geoCodingBaseService: GeoCodingBaseService;
  let adminRegionService: AdminRegionsService;
  let geoRegionRepository: GeoRegionRepository;
  let sourcingLocationService: SourcingLocationsService;
  let aggregationPointService: AggregationPointGeocodingService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, GeoCodingModule],
    }).compile();

    geoCodingService = moduleFixture.get(GeoCodingService);
    geoCodingBaseService = moduleFixture.get(GeoCodingBaseService);
    adminRegionService = moduleFixture.get(AdminRegionsService);
    geoRegionRepository = moduleFixture.get(GeoRegionRepository);
    sourcingLocationService = moduleFixture.get(SourcingLocationsService);
    aggregationPointService = moduleFixture.get(
      AggregationPointGeocodingService,
    );

    // app = moduleFixture.createNestApplication();
    // app.useGlobalPipes(
    //   new ValidationPipe({
    //     transform: true,
    //     whitelist: true,
    //     forbidNonWhitelisted: true,
    //   }),
    // );
    // await app.init();
  });

  afterEach(async () => {
    await geoRegionRepository.delete({});
  });

  //afterAll(async () => {});

  describe('Unknown Location Types Tests', () => {
    test('When a location is sent to the service, and has both address and coordinates, then an error should be shown ', async () => {
      const sourcingData = ({
        locationAddressInput: true,
        locationLatitude: true,
      } as unknown) as SourcingData;
      expect.assertions(1);
      try {
        await geoCodingService.geoCodeAggregationPoint(sourcingData);
      } catch (err) {
        expect(err.message).toEqual(
          expect.stringContaining(
            'Either and address or coordinates can be provided for a Aggregation Point Location Type',
          ),
        );
      }
    });
    test('When a unknown location types with coordinates is sent, then a new georegion should be created and a sourcingLocation saved', async () => {
      jest.spyOn(adminRegionService, 'getAdminRegionByName').mockResolvedValue({
        id: 'ddb17f37-4e6a-4494-95c8-26ed830317df',
      } as AdminRegion);
      jest
        .spyOn(sourcingLocationService, 'save')
        .mockResolvedValue((null as unknown) as SourcingLocation);
      const sourcingData = ({
        locationLongitude: 78.96288,
        locationLatitude: 20.593684,
      } as unknown) as SourcingData;
      await geoCodingService.geoCodeAggregationPoint(sourcingData);
      expect(sourcingLocationService.save).toHaveBeenCalledTimes(1);
      const geoRegion = await geoRegionRepository.find({});
      expect(geoRegion[0].h3Compact).toBeDefined();
      expect(geoRegion[0].theGeom).toBeDefined();
    });

    test('When a location is sent to the service, and its address geocode response is a country, then a error should be shown', async () => {
      jest
        .spyOn(aggregationPointService, 'geoCodeByAddress')
        .mockResolvedValue(geocodeResponses[2] as GeocodeResponseData);
      const sourcingData = ({
        locationAddressInput: true,
      } as unknown) as SourcingData;
      expect.assertions(1);
      try {
        await geoCodingService.geoCodeAggregationPoint(sourcingData);
      } catch (err) {
        expect(err.message).toEqual(
          expect.stringContaining(
            'is a Country, should be an address within a Country',
          ),
        );
      }
    });
    test('When a location is sent to the service, and its address geocode is an admin-level 1, then a sourcing location should be saved with these admin and geo region ids', async () => {
      const fakeIds = {
        adminRegionId: 'ddb17f37-4e6a-4494-95c8-26ed830317df',
        geoRegionId: 'ddb17f37-4e6a-4494-95c8-26ed830317df',
      };
      jest
        .spyOn(aggregationPointService, 'geoCodeByAddress')
        .mockResolvedValue(geocodeResponses[0] as GeocodeResponseData);
      jest
        .spyOn(adminRegionService, 'getAdminRegionIdByCoordinates')
        .mockResolvedValue(fakeIds);
      jest.spyOn(sourcingLocationService, 'save');

      const sourcingData = ({
        locationAddressInput: true,
      } as unknown) as SourcingData;
      await geoCodingService.geoCodeAggregationPoint(sourcingData);
      expect(
        adminRegionService.getAdminRegionIdByCoordinates,
      ).toHaveBeenCalled();
      expect(sourcingLocationService.save).toHaveBeenCalledWith({
        ...sourcingData,
        ...fakeIds,
      });
    });
  });
  describe('Country of Production Location Types', () => {
    test('When I send a location and it has no country, then a error should be shown', async () => {
      const sourcingData = ({
        locationCountryInput: null,
      } as unknown) as SourcingData;
      expect.assertions(1);
      try {
        await geoCodingService.geoCodeCountryOfProduction(sourcingData);
      } catch (err) {
        expect(err.message).toEqual(
          'A country where material is received needs to be provided for Country of Production Location Types',
        );
      }
    });
    test('When I send a location and it has both address and coordinates, then a error should be shown', async () => {
      const sourcingData = ({
        locationCountryInput: true,
        locationAddressInput: true,
        locationLatitude: true,
      } as unknown) as SourcingData;
      expect.assertions(1);
      try {
        await geoCodingService.geoCodeCountryOfProduction(sourcingData);
      } catch (err) {
        expect(err.message).toEqual(
          'Country of Production Location type must include either an address or coordinates',
        );
      }
    });
  });
});
