import { createSourcingLocation } from '../../entity-mocks';
import * as request from 'supertest';
import { GeoRegion } from '../../../src/modules/geo-regions/geo-region.entity';
import { LOCATION_TYPES } from '../../../src/modules/sourcing-locations/sourcing-location.entity';
import { TestManager } from '../../utils/test-manager';
import { Feature, Geometry } from 'geojson';
import { GivenGeoRegionWithGeometry } from '../../common-steps/given-geo-region';

export class GeoRegionsTestManager extends TestManager {
  constructor(manager: TestManager) {
    super(manager.testApp, manager.jwtToken, manager.dataSource);
  }

  GivenRegularSourcingLocationsWithGeoRegions = async () => {
    const geoRegion = await GivenGeoRegionWithGeometry();
    const geoRegion2 = await GivenGeoRegionWithGeometry();
    const sourcingLocation1 = await createSourcingLocation({
      geoRegionId: geoRegion.id,
      locationType: LOCATION_TYPES.ADMINISTRATIVE_REGION_OF_PRODUCTION,
    });
    const sourcingLocation2 = await createSourcingLocation({
      geoRegionId: geoRegion2.id,
      locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
    });
    return {
      sourcingLocations: [sourcingLocation1, sourcingLocation2],
      geoRegions: [geoRegion, geoRegion2],
    };
  };

  GivenEUDRSourcingLocationsWithGeoRegions = async () => {
    const geoRegion = await GivenGeoRegionWithGeometry();
    const geoRegion2 = await GivenGeoRegionWithGeometry();
    const sourcingLocation1 = await createSourcingLocation({
      geoRegionId: geoRegion.id,
      locationType: LOCATION_TYPES.EUDR,
    });
    const sourcingLocation2 = await createSourcingLocation({
      geoRegionId: geoRegion2.id,
      locationType: LOCATION_TYPES.EUDR,
    });
    return {
      eudrGeoRegions: [geoRegion, geoRegion2],
      eudrSourcingLocations: [sourcingLocation1, sourcingLocation2],
    };
  };

  WhenIRequestEUDRGeoFeatures = async (filters: {
    'geoRegionIds[]': string[];
    collection?: boolean;
  }): Promise<void> => {
    this.response = await request(this.testApp.getHttpServer())
      .get('/api/v1/eudr/geo-features')
      .query(filters)
      .set('Authorization', `Bearer ${this.jwtToken}`);
  };

  WhenIRequestEUDRGeoFeatureCollection = async (filters: {
    'geoRegionIds[]': string[];
  }): Promise<void> => {
    this.response = await request(this.testApp.getHttpServer())
      .get('/api/v1/eudr/geo-features/collection')
      .query(filters)
      .set('Authorization', `Bearer ${this.jwtToken}`);
  };

  ThenIShouldOnlyRecieveCorrespondingGeoFeatures = (
    eudrGeoRegions: GeoRegion[],
    collection?: boolean,
  ) => {
    expect(this.response!.status).toBe(200);
    if (collection) {
      expect(this.response!.body.geojson.type).toEqual('FeatureCollection');
      expect(this.response!.body.geojson.features.length).toBe(
        eudrGeoRegions.length,
      );
    } else {
      expect(this.response!.body[0].geojson.type).toEqual('Feature');
      expect(this.response!.body.length).toBe(eudrGeoRegions.length);
      for (const geoRegion of eudrGeoRegions) {
        expect(
          this.response!.body.find(
            (geoRegionResponse: { geojson: Feature }) =>
              geoRegionResponse.geojson.properties?.id === geoRegion.id,
          ),
        ).toBeDefined();
      }
    }
  };
}
