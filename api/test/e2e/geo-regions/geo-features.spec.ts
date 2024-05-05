import { GeoRegionsTestManager } from './fixtures';
import { TestManager } from '../../utils/test-manager';

describe('Geo Features tests (e2e)', () => {
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

  // Skipped test until EUDR module is fully integrated in the platform
  describe.skip('EUDR Geo Features', () => {
    test('should only get geo-features that are part of EUDR data', async () => {
      await testManager.GivenRegularSourcingLocationsWithGeoRegions();
      const { eudrGeoRegions } =
        await testManager.GivenEUDRSourcingLocationsWithGeoRegions();
      await testManager.WhenIRequestEUDRGeoFeatures({
        'geoRegionIds[]': eudrGeoRegions.map((r) => r.id),
      });
      testManager.ThenIShouldOnlyRecieveCorrespondingGeoFeatures(
        eudrGeoRegions,
      );
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
    test('should only get EUDR geo-features filtered by materials, suppliers and admin regions', async () => {
      const {} =
        await testManager.GivenRegularSourcingLocationsWithGeoRegions();
      const { eudrSourcingLocations, eudrGeoRegions } =
        await testManager.GivenEUDRSourcingLocationsWithGeoRegions();
      await testManager.WhenIRequestEUDRGeoFeatureCollection({
        'materialIds[]': [eudrSourcingLocations[0].materialId],
        'producerIds[]': [eudrSourcingLocations[0].producerId as string],
        'originIds[]': [eudrSourcingLocations[0].adminRegionId],
      });
      testManager.ThenIShouldOnlyRecieveCorrespondingGeoFeatures(
        [eudrGeoRegions[0]],
        true,
      );
    });
    test('sould only get EUDR geo-features as a FeatureCollection and filtered by geo regions', async () => {
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
    test('each feature should include the corresponding metadata', async () => {
      const { eudrSourcingLocations, eudrGeoRegions } =
        await testManager.GivenEUDRSourcingLocationsWithGeoRegions();
      await testManager.WhenIRequestEUDRGeoFeatureCollection();
      await testManager.ThenTheGeoFeaturesShouldHaveCorrectMetadata(
        eudrSourcingLocations,
      );
    });
  });
});
