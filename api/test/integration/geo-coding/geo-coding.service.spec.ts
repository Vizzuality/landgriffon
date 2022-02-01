import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app.module';
import { GeoCodingModule } from 'modules/geo-coding/geo-coding.module';
import { GeoCodingService } from 'modules/geo-coding/geo-coding.service';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { AggregationPointGeocodingService } from 'modules/geo-coding/geocoding-strategies/aggregation-point.geocoding.service';
import { geocodeResponses } from './mocks/geo-coding.mock-response';
import { GeocodeResponseData } from '@googlemaps/google-maps-services-js/dist/geocode/geocode';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { PointOfProductionGeocodingService } from 'modules/geo-coding/geocoding-strategies/point-of-production.geocoding.service';
import { UnknownLocationService } from 'modules/geo-coding/geocoding-strategies/unknown-location.geocoding.service';

// TODO: Re-organize properly tests. Handle all use cases

describe('GeoCoding Service (Integration Testing)', () => {
  let geoCodingService: GeoCodingService;
  let pointOfProductionService: PointOfProductionGeocodingService;
  let adminRegionService: AdminRegionsService;
  let geoRegionRepository: GeoRegionRepository;
  let sourcingLocationService: SourcingLocationsService;
  let aggregationPointService: AggregationPointGeocodingService;
  let adminRegionRepository: AdminRegionRepository;
  let unknownLocationService: UnknownLocationService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, GeoCodingModule],
    }).compile();
    adminRegionRepository = moduleFixture.get(AdminRegionRepository);
    geoCodingService = moduleFixture.get(GeoCodingService);
    adminRegionService = moduleFixture.get(AdminRegionsService);
    geoRegionRepository = moduleFixture.get(GeoRegionRepository);
    sourcingLocationService = moduleFixture.get(SourcingLocationsService);
    aggregationPointService = moduleFixture.get(
      AggregationPointGeocodingService,
    );
    pointOfProductionService = moduleFixture.get(
      PointOfProductionGeocodingService,
    );
    unknownLocationService = moduleFixture.get(UnknownLocationService);
  });

  afterEach(async () => {
    await geoRegionRepository.delete({});
    await adminRegionRepository.delete({});
  });

  describe('Unknown Location type tests', () => {
    test('When a unknown location types with coordinates is sent, then a sourcingLocation should be returned with Admin and GeoRegion IDs found in the DB', async () => {
      jest
        .spyOn(adminRegionService, 'getAdminAndGeoRegionIdByCountryIsoAlpha2')
        .mockResolvedValue({
          id: 'ddb17f37-4e6a-4494-95c8-26ed830317df',
          geoRegionId: 'ddb17f37-4e6a-4494-95c8-26ed830317df',
        });
      jest
        .spyOn(sourcingLocationService, 'save')
        .mockResolvedValue([] as unknown as SourcingLocation[]);
      jest
        .spyOn(unknownLocationService, 'geoCodeByCountry')
        .mockResolvedValue(geocodeResponses[4] as GeocodeResponseData);
      const sourcingData = {
        locationCountryInput: 'Asgard',
      } as unknown as SourcingData;
      const res: any = await geoCodingService.geoCodeUnknownLocationType(
        sourcingData,
      );

      expect(res.locationCountryInput).toEqual(
        sourcingData.locationCountryInput,
      );
      expect(res.geoRegionId).toEqual('ddb17f37-4e6a-4494-95c8-26ed830317df');
      expect(res.adminRegionId).toEqual('ddb17f37-4e6a-4494-95c8-26ed830317df');
    });
  });

  describe('Aggregation Point Locatio ', () => {
    test('When a location is sent to the service, and has both address and coordinates, then an error should be shown ', async () => {
      const sourcingData = {
        locationAddressInput: true,
        locationLatitude: true,
      } as unknown as SourcingData;
      expect.assertions(1);
      try {
        await geoCodingService.geoCodeAggregationPoint(sourcingData);
      } catch ({ message }) {
        expect(message).toEqual(
          expect.stringContaining(
            'Either and address or coordinates can be provided for a Aggregation Point Location Type',
          ),
        );
      }
    });

    test('When a location is sent to the service, and its address geocode response is a country, then a error should be shown', async () => {
      jest
        .spyOn(aggregationPointService, 'geoCodeByAddress')
        .mockResolvedValue(geocodeResponses[2] as GeocodeResponseData);
      const sourcingData = {
        locationAddressInput: true,
      } as unknown as SourcingData;
      expect.assertions(1);
      try {
        await geoCodingService.geoCodeAggregationPoint(sourcingData);
      } catch ({ message }) {
        expect(message).toEqual(
          expect.stringContaining(
            'is a country, should be an address within a country',
          ),
        );
      }
    });
    test('When a location is sent to the service, and its address geocode is an admin-level 1, then a sourcing location should be returned with these admin and geo region ids', async () => {
      const fakeIds = {
        adminRegionId: 'ddb17f37-4e6a-4494-95c8-26ed830317df',
        geoRegionId: 'ddb17f37-4e6a-4494-95c8-26ed830317df',
      };
      jest
        .spyOn(aggregationPointService, 'geoCodeByAddress')
        .mockResolvedValue(geocodeResponses[0] as GeocodeResponseData);
      jest
        .spyOn(adminRegionService, 'getAdminRegionIdByCoordinatesAndLevel')
        .mockResolvedValue(fakeIds);

      const sourcingData = {
        locationAddressInput: true,
      } as unknown as SourcingData;
      const res: any = await geoCodingService.geoCodeAggregationPoint(
        sourcingData,
      );
      expect(
        adminRegionService.getAdminRegionIdByCoordinatesAndLevel,
      ).toHaveBeenCalled();
      expect(res.geoRegionId).toEqual(fakeIds.geoRegionId);
      expect(res.adminRegionId).toEqual(fakeIds.adminRegionId);
    });
  });
  describe('Country of Production Location Types', () => {
    test('When I send a location and it has no country, then a error should be shown', async () => {
      const sourcingData = {
        locationCountryInput: null,
      } as unknown as SourcingData;
      expect.assertions(1);
      try {
        await geoCodingService.geoCodeCountryOfProduction(sourcingData);
      } catch ({ message }) {
        expect(message).toEqual(
          'A country where material is received needs to be provided for Country of Production Location Types',
        );
      }
    });
    test('When I send a location and it has both address and coordinates, then a error should be shown', async () => {
      const sourcingData = {
        locationCountryInput: true,
        locationAddressInput: true,
        locationLatitude: true,
      } as unknown as SourcingData;
      expect.assertions(1);
      try {
        await geoCodingService.geoCodeCountryOfProduction(sourcingData);
      } catch ({ message }) {
        expect(message).toEqual(
          'Country of Production Location type must include either an address or coordinates',
        );
      }
    });
  });
  describe('Point of Production Location Types', () => {
    test('When I send a location and it has no country, then a error should be shown', async () => {
      const sourcingData = {
        locationCountryInput: null,
      } as unknown as SourcingData;
      expect.assertions(1);
      try {
        await geoCodingService.geoCodePointOfProduction(sourcingData);
      } catch ({ message }) {
        expect(message).toEqual(
          'A country must be provided for Point of Production location type',
        );
      }
    });
    test('When I send a location and it has both address and coordinates, then a error should be shown', async () => {
      const sourcingData = {
        locationCountryInput: true,
        locationAddressInput: true,
        locationLatitude: true,
      } as unknown as SourcingData;
      expect.assertions(1);
      try {
        await geoCodingService.geoCodePointOfProduction(sourcingData);
      } catch ({ message }) {
        expect(message).toEqual(
          `For ${sourcingData.locationCountryInput} coordinates ${sourcingData.locationLatitude} ,${sourcingData.locationLongitude} and address ${sourcingData.locationAddressInput} has been provided. Either and address or coordinates can be provided for a Point of Production Location Type`,
        );
      }
    });
    test('When I send a location it has coordinates, then a geo-region point should be saved and a sourcing location returned with admin and geo-region ids', async () => {
      jest
        .spyOn(adminRegionService, 'getAdminAndGeoRegionIdByCountryIsoAlpha2')
        .mockResolvedValue({
          id: ' 18711f09-e810-40a2-b662-fdd1d6e9b0b9',
        } as any);
      jest
        .spyOn(pointOfProductionService, 'geoCodeByCountry')
        .mockResolvedValue(geocodeResponses[3] as GeocodeResponseData);
      const sourcingData = {
        locationCountryInput: true,
        locationLongitude: 78.96288,
        locationLatitude: 20.593684,
      } as unknown as SourcingData;

      const sourcingLocation: any =
        await geoCodingService.geoCodePointOfProduction(sourcingData);
      const geoRegion = await geoRegionRepository.find({});
      expect(sourcingLocation.geoRegionId).toEqual(geoRegion[0].id);
      expect(sourcingLocation.adminRegionId).toEqual(
        ' 18711f09-e810-40a2-b662-fdd1d6e9b0b9',
      );
      expect(geoRegion[0].theGeom).toEqual({
        coordinates: [78.96288, 20.593684],
        type: 'Point',
      });
      expect(geoRegion[0].isCreatedByUser).toEqual(true);
      expect(geoRegion[0].name).toEqual('-1215569786');
    });
  });
});
