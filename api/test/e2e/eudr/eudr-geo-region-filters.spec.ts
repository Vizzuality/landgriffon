import { EUDRTestManager } from './fixtures';
import { TestManager } from '../../utils/test-manager';

describe('GeoRegions Filters (e2e)', () => {
  let testManager: EUDRTestManager;

  beforeAll(async () => {
    testManager = await TestManager.load(EUDRTestManager);
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
  describe('EUDR Geo Regions Filters', () => {
    it('should only get geo-regions that are part of EUDR data', async () => {
      await testManager.GivenGeoRegionsOfSourcingLocations();
      const { eudrGeoRegions } = await testManager.GivenEUDRGeoRegions();
      const response = await testManager.WhenIRequestEUDRGeoRegions();
      testManager.ThenIShouldOnlyReceiveCorrespondingGeoRegions(eudrGeoRegions);
    });
  });
});
