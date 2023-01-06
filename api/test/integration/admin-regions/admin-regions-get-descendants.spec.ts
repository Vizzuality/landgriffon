import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { createAdminRegion } from '../../entity-mocks';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import AppSingleton from '../../utils/getApp';

describe('AdminRegions - Get descendants by Admin Region Ids', () => {
  let adminRegionRepository: AdminRegionRepository;
  let adminRegionService: AdminRegionsService;

  beforeAll(async () => {
    const appSingleton = await AppSingleton.init();
    const moduleFixture = appSingleton.moduleFixture;

    adminRegionRepository = moduleFixture.get<AdminRegionRepository>(
      AdminRegionRepository,
    );
    adminRegionService = moduleFixture.get(AdminRegionsService);

    await adminRegionRepository.delete({});
  });

  afterEach(async () => {
    await adminRegionRepository.delete({});
  });

  test('Get Admin Region descendants ids service should return ids of the requested Admin regions and the ids of their descendants', async () => {
    const adminRegion1: AdminRegion = await createAdminRegion({
      name: 'Admin Region 1',
      level: 0,
    });
    const adminRegion1Level1Descendant1: AdminRegion = await createAdminRegion({
      name: 'Admin Region 1 Level 1 Descendant 1',
      parent: adminRegion1,
      level: 1,
    });
    const adminRegion1Level1Descendant2: AdminRegion = await createAdminRegion({
      name: 'Admin Region 1 Level 1 Descendant 2',
      parent: adminRegion1,
      level: 1,
    });

    const adminRegion1Level2Descendant1: AdminRegion = await createAdminRegion({
      name: 'Admin Region 1 Level 2 Descendant 1',
      parent: adminRegion1Level1Descendant1,
      level: 2,
    });
    const adminRegion1Level2Descendant2: AdminRegion = await createAdminRegion({
      name: 'Admin Region 1 Level 2 Descendant 2',
      parent: adminRegion1Level1Descendant1,
      level: 2,
    });

    const adminRegion1Level2Descendant3: AdminRegion = await createAdminRegion({
      name: 'Admin Region 1 Level 2 Descendant 3',
      parent: adminRegion1Level1Descendant2,
      level: 2,
    });
    const adminRegion2: AdminRegion = await createAdminRegion({
      name: 'Admin Region 2',
      level: 0,
    });
    const adminRegion2Level1Descendant1: AdminRegion = await createAdminRegion({
      name: 'Admin Region 2 Level 1 Descendant 1',
      parent: adminRegion2,
      level: 1,
    });

    const adminRegion2Level2Descendant1: AdminRegion = await createAdminRegion({
      name: 'Admin Region 2 GrandChild 1',
      parent: adminRegion2Level1Descendant1,
      level: 2,
    });

    const adminRegion1AllDescendants: string[] =
      await adminRegionService.getAdminRegionDescendants([adminRegion1.id]);

    expect(adminRegion1AllDescendants.length).toBe(6);
    expect(adminRegion1AllDescendants).toEqual(
      expect.arrayContaining([
        adminRegion1.id,
        adminRegion1Level1Descendant1.id,
        adminRegion1Level1Descendant2.id,
        adminRegion1Level2Descendant1.id,
        adminRegion1Level2Descendant2.id,
        adminRegion1Level2Descendant3.id,
      ]),
    );

    const adminRegionsOfLevel2: string[] =
      await adminRegionService.getAdminRegionDescendants([
        adminRegion1Level2Descendant2.id,
        adminRegion1Level2Descendant3.id,
      ]);
    expect(adminRegionsOfLevel2.length).toBe(2);
    expect(adminRegion1AllDescendants).toEqual(
      expect.arrayContaining([
        adminRegion1Level2Descendant2.id,
        adminRegion1Level2Descendant3.id,
      ]),
    );

    const adminRegionsOfLevel1: string[] =
      await adminRegionService.getAdminRegionDescendants([
        adminRegion1Level1Descendant1.id,
        adminRegion2Level1Descendant1.id,
      ]);
    expect(adminRegionsOfLevel1.length).toBe(5);
    expect(adminRegionsOfLevel1).toEqual(
      expect.arrayContaining([
        adminRegion1Level1Descendant1.id,
        adminRegion1Level2Descendant1.id,
        adminRegion1Level2Descendant2.id,
        adminRegion2Level1Descendant1.id,
        adminRegion2Level2Descendant1.id,
      ]),
    );

    const adminRegionsOfDifferentLevels: string[] =
      await adminRegionService.getAdminRegionDescendants([
        adminRegion1Level1Descendant1.id,
        adminRegion1Level2Descendant3.id,
        adminRegion2.id,
      ]);
    expect(adminRegionsOfDifferentLevels.length).toBe(7);
    expect(adminRegionsOfDifferentLevels).toEqual(
      expect.arrayContaining([
        adminRegion1Level1Descendant1.id,
        adminRegion1Level2Descendant1.id,
        adminRegion1Level2Descendant2.id,
        adminRegion1Level2Descendant3.id,
        adminRegion2.id,
        adminRegion2Level1Descendant1.id,
        adminRegion2Level2Descendant1.id,
      ]),
    );
  });
});
