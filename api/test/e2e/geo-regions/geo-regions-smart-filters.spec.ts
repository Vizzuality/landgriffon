import { DataSource } from 'typeorm';
import ApplicationManager from '../../utils/application-manager';
import { TestApplication } from '../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { setupTestUser } from '../../utils/userAuth';

import { geoRegionFixtures } from './fixtures';

describe('GeoRegions Filters (e2e)', () => {
  const fixtures = geoRegionFixtures();
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
  describe('EUDR Geo Regions Filters', () => {
    it('should only get geo-regions that are part of EUDR data', async () => {
      await fixtures.GivenGeoRegionsOfSourcingLocations();
      const { eudrGeoRegions } = await fixtures.GivenEUDRGeoRegions();
      const response = await fixtures.WhenIRequestEUDRGeoRegions({
        app: testApplication,
        jwtToken,
      });
      fixtures.ThenIShouldOnlyReceiveEUDRGeoRegions(response, eudrGeoRegions);
    });
  });
});
