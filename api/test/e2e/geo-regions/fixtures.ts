import { createGeoRegion, createSourcingLocation } from '../../entity-mocks';
import { TestApplication } from '../../utils/application-manager';
import * as request from 'supertest';
import { GeoRegion } from '../../../src/modules/geo-regions/geo-region.entity';
import { LOCATION_TYPES } from '../../../src/modules/sourcing-locations/sourcing-location.entity';

export const geoRegionFixtures = () => ({
  GivenGeoRegionsOfSourcingLocations: async () => {
    const geoRegion = await createGeoRegion({
      name: 'Regular GeoRegion',
    });
    const geoRegion2 = await createGeoRegion({
      name: 'Regular GeoRegion 2',
    });
    await createSourcingLocation({ geoRegionId: geoRegion.id });
    await createSourcingLocation({ geoRegionId: geoRegion2.id });
    return {
      geoRegions: [geoRegion, geoRegion2],
    };
  },
  GivenEUDRGeoRegions: async () => {
    const geoRegion = await createGeoRegion({
      name: 'EUDR GeoRegion',
    });
    const geoRegion2 = await createGeoRegion({
      name: 'EUDR GeoRegion 2',
    });
    await createSourcingLocation({
      geoRegionId: geoRegion.id,
      locationType: LOCATION_TYPES.EUDR,
    });
    await createSourcingLocation({
      geoRegionId: geoRegion2.id,
      locationType: LOCATION_TYPES.EUDR,
    });
    return {
      eudrGeoRegions: [geoRegion, geoRegion2],
    };
  },
  WhenIRequestEUDRGeoRegions: async (options: {
    app: TestApplication;
    jwtToken: string;
  }) => {
    return request(options.app.getHttpServer())
      .get(`/api/v1/geo-regions/eudr`)
      .set('Authorization', `Bearer ${options.jwtToken}`);
  },
  ThenIShouldOnlyReceiveEUDRGeoRegions: (
    response: request.Response,
    eudrGeoRegions: GeoRegion[],
  ) => {
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(eudrGeoRegions.length);
    for (const geoRegion of eudrGeoRegions) {
      expect(
        response.body.data.find(
          (geoRegionResponse: GeoRegion) =>
            geoRegionResponse.id === geoRegion.id,
        ),
      ).toBeDefined();
    }
  },
});
