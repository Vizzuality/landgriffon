import {
  createAdminRegion,
  createGeoRegion,
  createMaterial,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
} from '../../entity-mocks';
import * as request from 'supertest';
import { GeoRegion } from '../../../src/modules/geo-regions/geo-region.entity';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from '../../../src/modules/sourcing-locations/sourcing-location.entity';
import { TestManager } from '../../utils/test-manager';
import { Feature } from 'geojson';
import { SourcingRecord } from '../../../src/modules/sourcing-records/sourcing-record.entity';
import { Supplier } from '../../../src/modules/suppliers/supplier.entity';

export class GeoRegionsTestManager extends TestManager {
  constructor(manager: TestManager) {
    super(manager.testApp, manager.jwtToken, manager.dataSource);
  }

  GivenRegularSourcingLocationsWithGeoRegions = async () => {
    const geoRegion = await createGeoRegion({
      name: this.generateRandomName(),
    });
    const geoRegion2 = await createGeoRegion({
      name: this.generateRandomName(),
    });
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
    const geoRegion = await createGeoRegion({
      name: this.generateRandomName(),
    });
    const geoRegion2 = await createGeoRegion({
      name: this.generateRandomName(),
    });

    const adminRegion = await createAdminRegion({ name: 'EUDR AdminRegion' });
    const adminRegion2 = await createAdminRegion({
      name: 'EUDR AdminRegion 2',
    });

    const supplier = await createSupplier({
      name: 'EUDR Supplier',
    });

    const material = await createMaterial({ name: 'EUDR Material' });
    const material2 = await createMaterial({ name: 'EUDR Material 2' });

    const supplier2 = await createSupplier({ name: 'EUDR Supplier 2' });
    const sourcingLocation1 = await createSourcingLocation({
      geoRegionId: geoRegion.id,
      locationType: 'eudr' as LOCATION_TYPES,
      adminRegionId: adminRegion.id,
      producerId: supplier.id,
      materialId: material.id,
    });
    const sourcingLocation2 = await createSourcingLocation({
      geoRegionId: geoRegion2.id,
      locationType: 'eudr' as LOCATION_TYPES,
      adminRegionId: adminRegion2.id,
      producerId: supplier2.id,
      materialId: material2.id,
    });
    for (const year of [2018, 2019, 2020, 2021, 2022, 2023]) {
      await createSourcingRecord({
        sourcingLocationId: sourcingLocation1.id,
        year,
        tonnage: 100 * year,
      });
      await createSourcingRecord({
        sourcingLocationId: sourcingLocation2.id,
        year,
        tonnage: 100 * year,
      });
    }
    return {
      eudrGeoRegions: [geoRegion, geoRegion2],
      eudrSourcingLocations: [sourcingLocation1, sourcingLocation2],
    };
  };

  WhenIRequestEUDRGeoFeatures = async (filters: {
    'geoRegionIds[]': string[];
    collection?: boolean;
  }): Promise<void> => {
    this.response = await this.getRequest({
      url: '/api/v1/eudr/geo-features',
      query: filters,
    });
  };

  WhenIRequestEUDRGeoFeatureCollection = async (filters?: {
    'geoRegionIds[]'?: string[];
    'producerIds[]'?: string[];
    'materialIds[]'?: string[];
    'originIds[]'?: string[];
  }): Promise<void> => {
    this.response = await this.getRequest({
      url: '/api/v1/eudr/geo-features/collection',
      query: filters,
    });
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

  ThenTheGeoFeaturesShouldHaveCorrectMetadata = async (
    sourceLocations: SourcingLocation[],
  ) => {
    for (const feature of this.response!.body.geojson.features) {
      const sourcingLocation = sourceLocations.find(
        (r: any) => r.geoRegionId === feature.properties.id,
      );
      const expectedMetadataContentForEachFeature = await this.dataSource
        .createQueryBuilder()
        .from(SourcingRecord, 'sr')
        .select('sr.tonnage', 'baselineVolume')
        .addSelect('gr.id', 'id')
        .addSelect('gr.name', 'plotName')
        .addSelect('s.name', 'supplierName')
        .innerJoin(SourcingLocation, 'sl', 'sr."sourcingLocationId" = sl.id')
        .innerJoin(Supplier, 's', 'sl."producerId" = s.id')
        .innerJoin(GeoRegion, 'gr', 'sl."geoRegionId" = gr.id')
        .where('sr."sourcingLocationId" = :sourcingLocationId', {
          sourcingLocationId: sourcingLocation!.id,
        })
        .andWhere('sr.year = :year', { year: 2020 })
        .getRawOne();
      expect(sourcingLocation).toBeDefined();
      expect(feature.properties).toEqual({
        id: expectedMetadataContentForEachFeature.id,
        supplierName: expectedMetadataContentForEachFeature.supplierName,
        plotName: expectedMetadataContentForEachFeature.plotName,
        baselineVolume: parseInt(
          expectedMetadataContentForEachFeature.baselineVolume,
        ),
      });
    }
  };
}
