import { GeoCodingService } from 'modules/geo-coding/geo-coding.service';
import { GeoCodingInterface } from '../../../src/modules/geo-coding/geo-coding-interface';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from '../../../src/modules/sourcing-locations/sourcing-location.entity';
import { SourcingData } from '../../../src/modules/import-data/sourcing-data/dto-processor.service';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import {
  clearEntityTables,
  clearTestDataFromDatabase,
} from '../../utils/database-test-helper';
import { GeoRegion } from '../../../src/modules/geo-regions/geo-region.entity';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { GeoCodingServiceV2 } from 'modules/geo-coding/geo-coding.service-v2';

describe('Custom Radius Geo Coding', () => {
  let geoCodingService: GeoCodingInterface;
  let testingModule: TestApplication;
  let dataSource: DataSource;
  let adminRegionService: AdminRegionsService;

  beforeAll(async () => {
    testingModule = await ApplicationManager.init();
    geoCodingService = testingModule.get<GeoCodingInterface>( GeoCodingService );
    adminRegionService = testingModule.get<AdminRegionsService>(AdminRegionsService);
    dataSource = testingModule.get<DataSource>(DataSource);

    jest
      .spyOn(adminRegionService, 'getClosestAdminRegionByCoordinates')
      .mockResolvedValue({ adminRegionId: v4() });
  });

  beforeEach(async () => {
    await clearEntityTables(dataSource, [SourcingLocation, GeoRegion]);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    await clearTestDataFromDatabase(dataSource);
    await testingModule.close();
  });

  test('When no radius provided, aggregation point location type should create a 50km radius', async () => {
    const sourcingData = [
      {
        locationLatitude: 37.4224082,
        locationLongitude: -122.0856086,
        locationCountryInput: 'United States',
        locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
      },
    ] as SourcingData[];
    const { geoCodedSourcingData } = await geoCodingService.geoCodeLocations(
      sourcingData,
    );
    const location = geoCodedSourcingData[0];
    expect(geoCodedSourcingData[0].radiusKm).toBe(50);
    expect(
      await getBufferRadiusInKm(dataSource, location.geoRegionId as string),
    ).toBeCloseTo(50, 1);
  });
  test('When a radius value of less than 1 is provided, aggregation point location type should create a 50km radius and a warning registered', async () => {
    const sourcingData = [
      {
        locationLatitude: 37.4224082,
        locationLongitude: -122.0856086,
        locationCountryInput: 'United States',
        locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
        radiusKm: -1,
      },
    ] as SourcingData[];
    const { geoCodedSourcingData } = await geoCodingService.geoCodeLocations(
      sourcingData,
    );
    const location = geoCodedSourcingData[0];
    expect(location.radiusKm).toBe(50);
    expect(
      await getBufferRadiusInKm(dataSource, location.geoRegionId as string),
    ).toBeCloseTo(50, 1);
    expect(location.locationWarning).toBe(
      'Provided radius is out of bounds. Defaulting to 50km',
    );
  });
  test('When a radius value of more than 1000 is provided, aggregation point location type should create a 50km radius and a warning registered', async () => {
    const sourcingData = [
      {
        locationLatitude: 37.4224082,
        locationLongitude: -122.0856086,
        locationCountryInput: 'United States',
        locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
        radiusKm: 1001,
      },
    ] as SourcingData[];
    const { geoCodedSourcingData } = await geoCodingService.geoCodeLocations(
      sourcingData,
    );
    const location = geoCodedSourcingData[0];
    expect(location.radiusKm).toBe(50);
    expect(
      await getBufferRadiusInKm(dataSource, location.geoRegionId as string),
    ).toBeCloseTo(50, 1);
    expect(location.locationWarning).toBe(
      'Provided radius is out of bounds. Defaulting to 50km',
    );
  });

  test('When a valid radius value is provided, aggregation point location type should create a custom radius of that radius', async () => {
    const sourcingData = [
      {
        locationLatitude: 37.4224082,
        locationLongitude: -122.0856086,
        locationCountryInput: 'United States',
        locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
        radiusKm: 123.4,
      },
    ] as SourcingData[];
    const { geoCodedSourcingData } = await geoCodingService.geoCodeLocations(
      sourcingData,
    );
    const location = geoCodedSourcingData[0];
    expect(location.radiusKm).toBe(123.4);
    expect(
      await getBufferRadiusInKm(dataSource, location.geoRegionId as string),
    ).toBeCloseTo(123.4, 1);
  });
});

const getBufferRadiusInKm = async (
  dataSource: DataSource,
  geoRegionId: string,
): Promise<number> => {
  const result = await dataSource.query(
    `
      WITH center AS (SELECT ST_Centroid("theGeom") AS center_geom
                      FROM geo_region
                      WHERE id = $1),
           boundary AS (SELECT ST_PointN(ST_ExteriorRing("theGeom"), 1) AS boundary_geom
                        FROM geo_region
                        WHERE id = $1)
      SELECT ST_Distance(center.center_geom::geography, boundary.boundary_geom::geography) / 1000.0 AS radius_km
      FROM center,
           boundary;
    `,
    [geoRegionId],
  );
  return result[0].radius_km;
};
