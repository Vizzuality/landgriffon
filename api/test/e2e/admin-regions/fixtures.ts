import * as request from 'supertest';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { createAdminRegion, createSourcingLocation } from '../../entity-mocks';
import { TestApplication } from '../../utils/application-manager';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { AndAssociatedMaterials } from '../../common-steps/and-associated-materials';
import { AndAssociatedSuppliers } from '../../common-steps/and-associated-suppliers';
import { Material } from 'modules/materials/material.entity';
import { Supplier } from '../../../src/modules/suppliers/supplier.entity';

export const adminRegionsFixtures = () => ({
  GivenAdminRegionsOfSourcingLocations: async () => {
    const adminRegion = await createAdminRegion({
      name: 'Regular AdminRegion',
    });
    const adminRegion2 = await createAdminRegion({
      name: 'Regular AdminRegion 2',
    });
    const sourcingLocation1 = await createSourcingLocation({
      adminRegionId: adminRegion.id,
    });
    const sourcingLocation2 = await createSourcingLocation({
      adminRegionId: adminRegion2.id,
    });
    return {
      adminRegions: [adminRegion, adminRegion2],
      sourcingLocations: [sourcingLocation1, sourcingLocation2],
    };
  },
  AndAssociatedMaterials: async (
    materials: Material[],
    sourcingLocations: SourcingLocation[],
  ) => {
    return AndAssociatedMaterials(materials, sourcingLocations);
  },
  AndAssociatedSuppliers: async (
    suppliers: Supplier[],
    sourcingLocations: SourcingLocation[],
  ) => {
    return AndAssociatedSuppliers(suppliers, sourcingLocations);
  },
  GivenEUDRAdminRegions: async () => {
    const adminRegion = await createAdminRegion({
      name: 'EUDR AdminRegion',
    });
    const adminRegion2 = await createAdminRegion({
      name: 'EUDR AdminRegion 2',
    });
    const eudrSourcingLocation1 = await createSourcingLocation({
      adminRegionId: adminRegion.id,
      locationType: LOCATION_TYPES.EUDR,
    });
    const eudrSourcingLocation2 = await createSourcingLocation({
      adminRegionId: adminRegion2.id,
      locationType: LOCATION_TYPES.EUDR,
    });
    return {
      eudrAdminRegions: [adminRegion, adminRegion2],
      eudrSourcingLocations: [eudrSourcingLocation1, eudrSourcingLocation2],
    };
  },
  WhenIRequestEUDRAdminRegions: async (options: {
    app: TestApplication;
    jwtToken: string;
  }) => {
    return request(options.app.getHttpServer())
      .get(`/api/v1/admin-regions/trees/eudr`)
      .set('Authorization', `Bearer ${options.jwtToken}`);
  },
  WhenIRequestEUDRAdminRegionWithFilters: async (options: {
    app: TestApplication;
    jwtToken: string;
    supplierIds?: string[];
    materialIds?: string[];
  }) => {
    return request(options.app.getHttpServer())
      .get(`/api/v1/admin-regions/trees/eudr`)
      .set('Authorization', `Bearer ${options.jwtToken}`)
      .query({
        'producerIds[]': options.supplierIds,
        'materialIds[]': options.materialIds,
      });
  },
  ThenIShouldOnlyReceiveFilteredEUDRAdminRegions: (
    response: request.Response,
    eudrAdminRegions: AdminRegion[],
  ) => {
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(eudrAdminRegions.length);
    for (const adminRegion of eudrAdminRegions) {
      expect(
        response.body.data.find(
          (adminRegionResponse: AdminRegion) =>
            adminRegionResponse.id === adminRegion.id,
        ),
      ).toBeDefined();
    }
  },
  ThenIShouldOnlyReceiveEUDRAdminRegions: (
    response: request.Response,
    eudrAdminRegions: AdminRegion[],
  ) => {
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(eudrAdminRegions.length);
    for (const adminRegion of eudrAdminRegions) {
      expect(
        response.body.data.find(
          (adminRegionResponse: AdminRegion) =>
            adminRegionResponse.id === adminRegion.id,
        ),
      ).toBeDefined();
    }
  },
});
