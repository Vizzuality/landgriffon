import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';
import { clearEntityTables } from '../../utils/database-test-helper';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { LocationGeoRegionDto } from 'modules/geo-regions/dto/location.geo-region.dto';
import { DataSource } from 'typeorm';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';

describe('GeoRegions - IntegrationTests', () => {
  let testApplication: TestApplication;
  let geoRegionRepository: GeoRegionRepository;
  let dataSource: DataSource;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    geoRegionRepository =
      testApplication.get<GeoRegionRepository>(GeoRegionRepository);
  });

  afterEach(async () => {
    await clearEntityTables(dataSource, [GeoRegion]);
  });

  test(
    'Given there is a previously existing geoRegion ' +
      'When I try to find a Radius geom by hashing its coordinates' +
      'Then I should get the existing one',
    async () => {
      const fakeGeoRegionInfo: LocationGeoRegionDto = {
        coordinates: {
          lat: 1.2345,
          lng: 6.789,
        },
      };

      const geoRegionId = await geoRegionRepository.saveGeoRegionAsPoint(
        fakeGeoRegionInfo,
      );

      const foundGeoRegion = await geoRegionRepository.getGeomPointByHashedName(
        fakeGeoRegionInfo.coordinates,
      );

      expect(foundGeoRegion).toHaveLength(1);
      expect(foundGeoRegion[0].id).toEqual(geoRegionId);
    },
  );

  test(
    'Given there is a previously existing geoRegion ' +
      'When I try to find a Point geom by hashing its coordinates' +
      'Then I should get the existing one',
    async () => {
      const fakeGeoRegionInfo: LocationGeoRegionDto = {
        coordinates: {
          lat: 1.2345,
          lng: 6.789,
        },
      };

      const geoRegionId = await geoRegionRepository.saveGeoRegionAsRadius(
        fakeGeoRegionInfo,
      );

      const foundGeoRegion =
        await geoRegionRepository.getGeomRadiusByHashedName(
          fakeGeoRegionInfo.coordinates,
        );

      expect(foundGeoRegion).toHaveLength(1);
      expect(foundGeoRegion[0].id).toEqual(geoRegionId);
    },
  );
});
