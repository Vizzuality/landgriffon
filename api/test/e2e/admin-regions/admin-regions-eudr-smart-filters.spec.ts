import { AdminRegionTestManager } from './fixtures';

describe('Admin Regions EUDR Filters (e2e)', () => {
  let testManager: AdminRegionTestManager;

  beforeAll(async () => {
    testManager = await AdminRegionTestManager.load();
  });

  beforeEach(async () => {
    await testManager.refreshState();
  });

  afterEach(async () => {
    await testManager.clearDatabase();
  });

  afterAll(async () => {
    await testManager.close();
  });
  describe('EUDR Admin Regions Filters', () => {
    it('should only get admin-regions that are part of EUDR data', async () => {
      await testManager.GivenAdminRegionsOfSourcingLocations();
      const { eudrAdminRegions } = await testManager.GivenEUDRAdminRegions();
      await testManager.WhenIRequestEUDRAdminRegions();
      testManager.ThenIShouldOnlyReceiveCorrespondingAdminRegions(
        eudrAdminRegions,
      );
    });
    it('should only get admin-regions that are part of EUDR data and are filtered', async () => {
      const { sourcingLocations } =
        await testManager.GivenAdminRegionsOfSourcingLocations();
      await testManager.AndAssociatedMaterials(sourcingLocations);
      await testManager.AndAssociatedSuppliers([sourcingLocations[0]]);
      const { eudrAdminRegions, eudrSourcingLocations } =
        await testManager.GivenEUDRAdminRegions();
      const eudrMaterials = await testManager.AndAssociatedMaterials([
        eudrSourcingLocations[0],
      ]);
      const eudrSuppliers = await testManager.AndAssociatedSuppliers(
        eudrSourcingLocations,
      );
      await testManager.WhenIRequestEUDRAdminRegions({
        'materialIds[]': [eudrMaterials[0].id],
        'producerIds[]': eudrSuppliers.map((s) => s.id),
      });
      testManager.ThenIShouldOnlyReceiveCorrespondingAdminRegions([
        eudrAdminRegions[0],
      ]);
    });
  });
});
