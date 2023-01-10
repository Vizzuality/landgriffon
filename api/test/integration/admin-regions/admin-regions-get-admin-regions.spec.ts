import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { createAdminRegion, createGeoRegion } from '../../entity-mocks';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

describe('AdminRegions - Get Admin Regions (Integration Tests)', () => {
  let testApplication: TestApplication;
  let adminRegionRepository: AdminRegionRepository;
  let adminRegionService: AdminRegionsService;
  let dataSource: DataSource;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    adminRegionRepository = testApplication.get<AdminRegionRepository>(
      AdminRegionRepository,
    );
    adminRegionService = testApplication.get(AdminRegionsService);

    await adminRegionRepository.delete({});
  });

  afterEach(async () => {
    await clearTestDataFromDatabase(dataSource);
  });

  test('When I provide a AdminRegion name, Then I should get that AdminRegion Id with its GeoRegion Id', async () => {
    const geoRegion = await createGeoRegion();
    const adminRegion: AdminRegion = await createAdminRegion({
      geoRegion,
      name: 'Wakanda',
    });
    await createAdminRegion({
      geoRegion,
      name: 'Namek',
    });

    const result =
      await adminRegionService.getAdminRegionAndGeoRegionIdsByAdminRegionName(
        adminRegion.name as string,
      );

    expect(result.adminRegionId).toEqual(adminRegion.id);
    expect(result.geoRegionId).toEqual(geoRegion.id);
  });

  test('When I provide a AdminRegion name and a level, Then I should get the AdminRegion matching the name and the level', async () => {
    const geoRegion = await createGeoRegion({ name: 'geo1' });
    const geoRegion2 = await createGeoRegion({ name: 'geo2' });
    const adminRegion: AdminRegion = await createAdminRegion({
      geoRegion,
      name: 'Wakanda',
      level: 0,
    });
    const adminRegion2 = await createAdminRegion({
      geoRegion: geoRegion2,
      name: 'Wakanda',
      level: 1,
    });

    const result =
      await adminRegionService.getAdminRegionAndGeoRegionIdsByAdminRegionName(
        adminRegion.name as string,
        { level: 0 },
      );

    const result2 =
      await adminRegionService.getAdminRegionAndGeoRegionIdsByAdminRegionName(
        adminRegion.name as string,
        { level: 1 },
      );

    expect(result.adminRegionId).toEqual(adminRegion.id);
    expect(result.geoRegionId).toEqual(geoRegion.id);
    expect(result2.adminRegionId).toEqual(adminRegion2.id);
    expect(result2.geoRegionId).toEqual(geoRegion2.id);
  });

  test('When I provide a AdminRegion name, and optionally a level, But any is found, Then I should get a proper error for each case', async () => {
    expect.assertions(2);
    const name: string = 'Can you find this?';

    try {
      await adminRegionService.getAdminRegionAndGeoRegionIdsByAdminRegionName(
        name,
      );
    } catch (e: any) {
      expect(e.message).toEqual(
        `An Admin Region with name ${name} could not been found`,
      );
    }

    const options: { level: number } = { level: 1 };
    try {
      await adminRegionService.getAdminRegionAndGeoRegionIdsByAdminRegionName(
        name,
        options,
      );
    } catch (e: any) {
      expect(e.message).toEqual(
        `An Admin Region with name ${name} and level ${options.level} could not been found`,
      );
    }
  });
});
