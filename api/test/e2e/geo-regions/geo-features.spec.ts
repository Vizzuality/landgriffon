import { GeoRegionsTestManager } from './fixtures';
import { TestManager } from '../../utils/test-manager';

describe('Admin Regions EUDR Filters (e2e)', () => {
  let testManager: GeoRegionsTestManager;

  beforeAll(async () => {
    testManager = await TestManager.load(GeoRegionsTestManager);
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

  test('should only get geo-features that are part of EUDR data', async () => {
    await testManager.GivenRegularSourcingLocationsWithGeoRegions();
    const { eudrGeoRegions } =
      await testManager.GivenEUDRSourcingLocationsWithGeoRegions();
    await testManager.WhenIRequestEUDRGeoFeatures({
      'geoRegionIds[]': eudrGeoRegions.map((r) => r.id),
    });
    testManager.ThenIShouldOnlyRecieveCorrespondingGeoFeatures(eudrGeoRegions);
  });

  test('should only get geo-features that are part of EUDR data and are filtered by geo region id', async () => {
    await testManager.GivenRegularSourcingLocationsWithGeoRegions();
    const { eudrGeoRegions } =
      await testManager.GivenEUDRSourcingLocationsWithGeoRegions();
    await testManager.WhenIRequestEUDRGeoFeatures({
      'geoRegionIds[]': [eudrGeoRegions[0].id],
    });
    testManager.ThenIShouldOnlyRecieveCorrespondingGeoFeatures([
      eudrGeoRegions[0],
    ]);
  });
  test('sould only get EUDR geo-features as a FeatureCollection', async () => {
    await testManager.GivenRegularSourcingLocationsWithGeoRegions();
    const { eudrGeoRegions } =
      await testManager.GivenEUDRSourcingLocationsWithGeoRegions();
    await testManager.WhenIRequestEUDRGeoFeatureCollection({
      'geoRegionIds[]': eudrGeoRegions.map((r) => r.id),
    });
    testManager.ThenIShouldOnlyRecieveCorrespondingGeoFeatures(
      eudrGeoRegions,
      true,
    );
  });
});
