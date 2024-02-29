import { DataSource } from 'typeorm';
import { createMaterial, createSupplier } from '../../entity-mocks';
import ApplicationManager from '../../utils/application-manager';
import { TestApplication } from '../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { setupTestUser } from '../../utils/userAuth';
import { adminRegionsFixtures } from './fixtures';

describe('GeoRegions Filters (e2e)', () => {
  const fixtures = adminRegionsFixtures();
  let testApplication: TestApplication;
  let jwtToken: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);
  });
  beforeEach(async () => {
    ({ jwtToken } = await setupTestUser(testApplication));
  });

  afterEach(async () => {
    await clearTestDataFromDatabase(dataSource);
  });

  afterAll(async () => {
    await testApplication.close();
  });
  describe('EUDR Admin Regions Filters', () => {
    it('should only get geo-regions that are part of EUDR data', async () => {
      await fixtures.GivenAdminRegionsOfSourcingLocations();
      const { eudrAdminRegions } = await fixtures.GivenEUDRAdminRegions();
      const response = await fixtures.WhenIRequestEUDRAdminRegions({
        app: testApplication,
        jwtToken,
      });
      fixtures.ThenIShouldOnlyReceiveEUDRAdminRegions(
        response,
        eudrAdminRegions,
      );
    });
    it('should only get geo-regions that are part of EUDR data and are filtered', async () => {
      const { sourcingLocations } =
        await fixtures.GivenAdminRegionsOfSourcingLocations();
      const regularMaterial = await createMaterial({
        name: 'Regular Material',
      });
      await fixtures.AndAssociatedMaterials(
        [regularMaterial],
        sourcingLocations,
      );
      const regularSupplier = await createSupplier({
        name: 'Regular Supplier',
      });
      await fixtures.AndAssociatedSuppliers(
        [regularSupplier],
        sourcingLocations,
      );
      const { eudrAdminRegions, eudrSourcingLocations } =
        await fixtures.GivenEUDRAdminRegions();
      const eudrMaterial = await createMaterial({ name: 'EUDR Material' });
      await fixtures.AndAssociatedMaterials(
        [eudrMaterial],
        [eudrSourcingLocations[0]],
      );
      const eudrSupplier = await createSupplier({ name: 'EUDR Supplier' });
      await fixtures.AndAssociatedSuppliers(
        [eudrSupplier],
        eudrSourcingLocations,
      );
      const response = await fixtures.WhenIRequestEUDRAdminRegionWithFilters({
        app: testApplication,
        jwtToken,
        materialIds: [eudrMaterial.id],
        supplierIds: [eudrSupplier.id],
      });
      fixtures.ThenIShouldOnlyReceiveFilteredEUDRAdminRegions(response, [
        eudrAdminRegions[0],
      ]);
    });
  });
});
