import { GeoCodingService } from 'modules/geo-coding/geo-coding.service';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { AggregationPointGeocodingStrategy } from 'modules/geo-coding/strategies/aggregation-point.geocoding.service';
import {
  geocodeResponses,
  geometryOfAggregationPoint,
  h3FlatOfAggregationPoint,
} from './mocks/geo-coding.mock-response';
import { GeocodeResponseData } from '@googlemaps/google-maps-services-js/dist/geocode/geocode';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { PointOfProductionGeocodingStrategy } from 'modules/geo-coding/strategies/point-of-production.geocoding.service';
import { UnknownLocationGeoCodingStrategy } from 'modules/geo-coding/strategies/unknown-location.geocoding.service';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { cast } from '../../utils/type-utils';

// TODO: Re-organize properly tests. Handle all use cases

describe('GeoCoding Service (Integration Testing)', () => {
  let testApplication: TestApplication;
  let geoCodingService: GeoCodingService;
  let pointOfProductionService: PointOfProductionGeocodingStrategy;
  let adminRegionService: AdminRegionsService;
  let geoRegionRepository: GeoRegionRepository;
  let sourcingLocationService: SourcingLocationsService;
  let aggregationPointService: AggregationPointGeocodingStrategy;
  let adminRegionRepository: AdminRegionRepository;
  let unknownLocationService: UnknownLocationGeoCodingStrategy;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    adminRegionRepository = testApplication.get(AdminRegionRepository);
    geoCodingService = testApplication.get(GeoCodingService);
    adminRegionService = testApplication.get(AdminRegionsService);
    geoRegionRepository = testApplication.get(GeoRegionRepository);
    sourcingLocationService = testApplication.get(SourcingLocationsService);
    aggregationPointService = testApplication.get(
      AggregationPointGeocodingStrategy,
    );
    pointOfProductionService = testApplication.get(
      PointOfProductionGeocodingStrategy,
    );
    unknownLocationService = testApplication.get(
      UnknownLocationGeoCodingStrategy,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    await geoRegionRepository.delete({});
    await adminRegionRepository.delete({});
  });

  const adminRegionIdMock = 'ddb17f37-4e6a-4494-95c8-26ed830317df'
  const geoRegionIdMock = 'ddb17f37-4e6a-4494-95c8-26ed830317df'

  const invalidCountryName = 'Asgard';

  const adminRegionAndGeoRegionMock = {
    adminRegionId: adminRegionIdMock,
    geoRegionId: geoRegionIdMock
  };

  describe('Unknown Location type tests', () => {
    test('When a unknown location type without country is sent, proper error message must be received', async () => {
      jest.spyOn(adminRegionService, 'getAdminRegionAndGeoRegionIdsByAdminRegionName')
        .mockResolvedValueOnce(adminRegionAndGeoRegionMock);

      jest.spyOn(sourcingLocationService, 'save')
        .mockResolvedValueOnce([] as unknown as SourcingLocation[]);

      jest.spyOn(unknownLocationService, 'geoCodeByCountry')
        .mockResolvedValueOnce(geocodeResponses[4] as GeocodeResponseData);

      const sourcingData = cast<SourcingData>({ locationCountryInput: null });

      expect(geoCodingService.geoCodeUnknownLocationType(sourcingData))
        .rejects.toThrowError('A country where material is received needs to be provided for Unknown Location Types');
    });

    test('When a unknown location type with coordinates is sent, proper error message must be received', async () => {
      jest.spyOn(adminRegionService, 'getAdminRegionAndGeoRegionIdsByAdminRegionName')
        .mockResolvedValueOnce(adminRegionAndGeoRegionMock);

      jest
        .spyOn(sourcingLocationService, 'save')
        .mockResolvedValueOnce(cast<SourcingLocation[]>([]));

      jest
        .spyOn(unknownLocationService, 'geoCodeByCountry')
        .mockResolvedValueOnce(geocodeResponses[4] as GeocodeResponseData);

      const sourcingDataWithCoordinates = cast<SourcingData>({
        locationCountryInput: invalidCountryName,
        locationLongitude: 78.96288,
        locationLatitude: 20.593684,
      });

      expect(geoCodingService.geoCodeUnknownLocationType(sourcingDataWithCoordinates))
        .rejects.toThrowError('Unknown Location type should not include an address or coordinates');
    });

    test('When a unknown location type with address is sent, proper error message must be received', async () => {
      jest.spyOn(adminRegionService, 'getAdminRegionAndGeoRegionIdsByAdminRegionName')
        .mockImplementationOnce(() => { throw new Error(`An Admin Region with name ${invalidCountryName} could not been found`); });

      const sourcingDataWithAddress = cast<SourcingData>({
        locationCountryInput: invalidCountryName,
        locationAddress: 'Valhalla, 3',
      });

      expect(geoCodingService.geoCodeUnknownLocationType(sourcingDataWithAddress))
        .rejects.toThrowError(`An Admin Region with name ${sourcingDataWithAddress.locationCountryInput} could not been found`);
    });

    test('When a unknown location types with coordinates is sent, then a sourcingLocation should be returned with Admin and GeoRegion IDs found in the DB', async () => {
      jest.spyOn(adminRegionService, 'getAdminRegionAndGeoRegionIdsByAdminRegionName')
        .mockResolvedValueOnce(adminRegionAndGeoRegionMock);

      jest
        .spyOn(sourcingLocationService, 'save')
        .mockResolvedValueOnce(cast<SourcingLocation[]>([]));

      jest
        .spyOn(unknownLocationService, 'geoCodeByCountry')
        .mockResolvedValueOnce(geocodeResponses[4] as GeocodeResponseData);

      const sourcingData = cast<SourcingData>({ locationCountryInput: invalidCountryName });
      const res = await geoCodingService.geoCodeUnknownLocationType(sourcingData);

      expect(res.locationCountryInput).toEqual(sourcingData.locationCountryInput);
      expect(res.geoRegionId).toEqual(geoRegionIdMock);
      expect(res.adminRegionId).toEqual(adminRegionIdMock);
    });
  });

  describe('Aggregation Point Location ', () => {
    test('When a location is sent to the service, and has both address and coordinates, then an error should be shown ', async () => {
      const sourcingData = cast<SourcingData>({
        locationAddressInput: true,
        locationLatitude: true,
      });

      expect(geoCodingService.geoCodeAggregationPoint(sourcingData))
        .rejects.toThrowError('Either and address or coordinates can be provided for a Aggregation Point Location Type');
    });

    test('When a location is sent to the service, and its address geocode response is a country, then a error should be shown', async () => {
      jest
        .spyOn(aggregationPointService, 'geoCodeByAddress')
        .mockResolvedValueOnce({
          data: geocodeResponses[2] as GeocodeResponseData,
          warning: undefined,
        });

      const sourcingData = cast<SourcingData>({
        locationAddressInput: true,
        locationCountryInput: true,
      });

      expect(geoCodingService.geoCodeAggregationPoint(sourcingData))
        .rejects.toThrowError('is a country, should be an address within a country');
    });

    test('When a location is sent to the service, and its address geocode is an admin-level 1, then a sourcing location should be returned with these admin and geo region ids', async () => {
      jest
        .spyOn(aggregationPointService, 'geoCodeByAddress')
        .mockResolvedValueOnce({
          data: geocodeResponses[0] as GeocodeResponseData,
          warning: undefined,
        });

      jest
        .spyOn(adminRegionService, 'getAdminRegionIdByCoordinatesAndLevel')
        .mockResolvedValueOnce(adminRegionAndGeoRegionMock);

      const sourcingData = cast<SourcingData>({
        locationAddressInput: "fakeLocationAddressInput",
        locationCountryInput: "fakeLocationCountryInput",
      });

      const res = await geoCodingService.geoCodeAggregationPoint(sourcingData);

      expect(adminRegionService.getAdminRegionIdByCoordinatesAndLevel).toHaveBeenCalledTimes(1);
      expect(res.geoRegionId).toEqual(geoRegionIdMock);
      expect(res.adminRegionId).toEqual(adminRegionIdMock);
    });

    test('When Aggregation point location with coordinates is sent to service, geo-region radius should be saved and a sourcing location returned with admin and geo-region ids', async () => {
      jest
        .spyOn(adminRegionService, 'getClosestAdminRegionByCoordinates')
        .mockResolvedValueOnce({ adminRegionId: adminRegionIdMock } as any);

      jest
        .spyOn(aggregationPointService, 'geoCodeByCountry')
        .mockResolvedValueOnce(geocodeResponses[3] as GeocodeResponseData);

      const sourcingData = cast<SourcingData>({
        locationCountryInput: "fakeLocationCountryInput",
        locationLongitude: 78.96288,
        locationLatitude: 20.593684,
      });

      const sourcingLocation = await geoCodingService.geoCodeAggregationPoint(sourcingData);
      const geoRegion = await geoRegionRepository.find({});

      expect(sourcingLocation.geoRegionId).toEqual(geoRegion[0].id);
      expect(sourcingLocation.adminRegionId).toEqual(adminRegionIdMock);
      expect(geoRegion[0].isCreatedByUser).toEqual(true);
      expect(geoRegion[0].h3FlatLength).toEqual(216);
    });
  });

  describe('Country of Production Location Types', () => {
    test('When I send a location and it has no country, then a error should be shown', async () => {
      const sourcingData = cast<SourcingData>({ locationCountryInput: null });

      expect(geoCodingService.geoCodeCountryOfProduction(sourcingData))
        .rejects.toThrowError('A country where material is received needs to be provided for Country of Production Location Types');
    });

    test('When I send a location and it has both address and coordinates, then a error should be shown', async () => {
      const sourcingData = cast<SourcingData>({
        locationCountryInput: "fakeLocationCountryInput",
        locationAddressInput: "fakeLocationAddressInput",
        locationLatitude: 1,
        locationLongitude: 1,
      });

      expect(geoCodingService.geoCodeCountryOfProduction(sourcingData))
        .rejects.toThrowError('Country of Production Location type must include either an address or coordinates');
    });
  });

  describe('Point of Production Location Types', () => {
    test('When I send a location and it has no country, then a error should be shown', async () => {
      const sourcingData = cast<SourcingData>({ locationCountryInput: null });

      expect(geoCodingService.geoCodePointOfProduction(sourcingData))
        .rejects.toThrowError('A country must be provided for Point of Production location type');
    });

    test('When I send a location and it has both address and coordinates, then a error should be shown', async () => {
      const sourcingData = cast<SourcingData>({
        locationCountryInput: "fakeLocationCountryInput",
        locationAddressInput: "fakeLocationAddressInput",
        locationLatitude: 1,
        locationLongitude: 1,
      });

      expect(geoCodingService.geoCodePointOfProduction(sourcingData))
        .rejects.toThrowError(`For ${sourcingData.locationCountryInput} coordinates ${sourcingData.locationLatitude} ,${sourcingData.locationLongitude} and address ${sourcingData.locationAddressInput} has been provided. Either and address or coordinates can be provided for a Point of Production Location Type`);
    });

    test('When Point of production location with coordinates is sent, geo-region point should be saved and a sourcing location returned with admin and geo-region ids', async () => {
      jest
        .spyOn(adminRegionService, 'getClosestAdminRegionByCoordinates')
        .mockResolvedValueOnce({ adminRegionId: adminRegionIdMock } as any);

      jest
        .spyOn(pointOfProductionService, 'geoCodeByCountry')
        .mockResolvedValueOnce(geocodeResponses[3] as GeocodeResponseData);

      const sourcingData = cast<SourcingData>({
        locationCountryInput: "fakeLocationCountryInput",
        locationLongitude: 78.96288,
        locationLatitude: 20.593684,
      });

      const sourcingLocation = await geoCodingService.geoCodePointOfProduction(sourcingData);
      const geoRegion = await geoRegionRepository.find({});

      expect(sourcingLocation.geoRegionId).toEqual(geoRegion[0].id);
      expect(sourcingLocation.adminRegionId).toEqual(adminRegionIdMock);
      expect(geoRegion[0].theGeom).toEqual({
        coordinates: [78.96288, 20.593684],
        type: 'Point',
      });
      expect(geoRegion[0].isCreatedByUser).toEqual(true);
      expect(geoRegion[0].name).toEqual('-1215569786');
      expect(geoRegion[0].h3FlatLength).toEqual(1);
      expect(geoRegion[0].h3Flat).toEqual(['866094407ffffff']);
    });

    test('When invalid Point of production location with coordinates is sent, geo-region point should not be saved', async () => {
      jest
        .spyOn(adminRegionService, 'getClosestAdminRegionByCoordinates')
        .mockRejectedValueOnce({});

      jest
        .spyOn(pointOfProductionService, 'geoCodeByCountry')
        .mockResolvedValueOnce(geocodeResponses[3] as GeocodeResponseData);

      const sourcingData = cast<SourcingData>({
        locationCountryInput: "",
        locationLongitude: 1,
        locationLatitude: 1,
      });

      expect(geoCodingService.geoCodePointOfProduction(sourcingData))
        .rejects.toThrowError('A country must be provided for Point of Production location type');

      const geoRegion = await geoRegionRepository.find({});
      expect(geoRegion.length).toEqual(0);
    });
  });
});
