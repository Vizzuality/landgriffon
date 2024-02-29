import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { createAdminRegion, createSourcingLocation } from '../../entity-mocks';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { AndAssociatedMaterials } from '../../common-steps/and-associated-materials';
import { AndAssociatedSuppliers } from '../../common-steps/and-associated-suppliers';
import { TestManager } from '../../utils/test-manager';
import { GeoRegion } from '../../../src/modules/geo-regions/geo-region.entity';

export class EUDRTestManager extends TestManager {
  url = '/api/v1/eudr/';

  constructor(manager: TestManager) {
    super(manager.testApp, manager.jwtToken, manager.dataSource);
  }

  static async load() {
    return new EUDRTestManager(await this.createManager());
  }

  GivenAdminRegionsOfSourcingLocations = async () => {
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
  };
  AndAssociatedMaterials = async (
    sourcingLocations: SourcingLocation[],
    materialNames?: string[],
  ) => {
    const materials = await this.createMaterials(materialNames);
    await AndAssociatedMaterials(materials, sourcingLocations);
    return materials;
  };
  AndAssociatedSuppliers = async (
    sourcingLocations: SourcingLocation[],
    supplierNames?: string[],
  ) => {
    const suppliers = await this.createSuppliers(supplierNames);
    await AndAssociatedSuppliers(suppliers, sourcingLocations);
    return suppliers;
  };
  GivenEUDRAdminRegions = async () => {
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
  };
  WhenIRequestEUDRAdminRegions = async (filters?: {
    'producerIds[]'?: string[];
    'materialIds[]'?: string[];
  }) => {
    return this.GET({ url: `${this.url}/admin-regions`, query: filters });
  };

  ThenIShouldOnlyReceiveCorrespondingAdminRegions = (
    eudrAdminRegions: AdminRegion[],
  ) => {
    expect(this.response!.status).toBe(200);
    expect(this.response!.body.data.length).toBe(eudrAdminRegions.length);
    for (const adminRegion of eudrAdminRegions) {
      expect(
        this.response!.body.data.find(
          (adminRegionResponse: AdminRegion) =>
            adminRegionResponse.id === adminRegion.id,
        ),
      ).toBeDefined();
    }
  };

  GivenGeoRegionsOfSourcingLocations = async () => {
    const [geoRegion, geoRegion2] = await this.createGeoRegions([
      'Regular GeoRegion',
      'Regular GeoRegion 2',
    ]);
    await createSourcingLocation({ geoRegionId: geoRegion.id });
    await createSourcingLocation({ geoRegionId: geoRegion2.id });
    return {
      geoRegions: [geoRegion, geoRegion2],
    };
  };

  GivenEUDRGeoRegions = async () => {
    const [geoRegion, geoRegion2] = await this.createGeoRegions([
      'EUDR GeoRegion',
      'EUDR GeoRegion 2',
    ]);
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
  };

  WhenIRequestEUDRGeoRegions = async (filters?: {
    'producerIds[]'?: string[];
    'materialIds[]'?: string[];
  }) => {
    return this.GET({ url: `${this.url}/geo-regions`, query: filters });
  };

  ThenIShouldOnlyReceiveCorrespondingGeoRegions = (
    eudrGeoRegions: GeoRegion[],
  ) => {
    expect(this.response!.status).toBe(200);
    expect(this.response!.body.data.length).toBe(eudrGeoRegions.length);
    for (const geoRegion of eudrGeoRegions) {
      expect(
        this.response!.body.data.find(
          (adminRegionResponse: AdminRegion) =>
            adminRegionResponse.id === geoRegion.id,
        ),
      ).toBeDefined();
    }
  };
}
