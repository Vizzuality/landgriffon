import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import {
  createAdminRegion,
  createBusinessUnit,
  createIndicator,
  createIndicatorRecord,
  createMaterial,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
  createUnit,
} from '../entity-mocks';
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from '../../src/modules/indicators/indicator.entity';
import { SourcingRecord } from '../../src/modules/sourcing-records/sourcing-record.entity';
import { Material } from '../../src/modules/materials/material.entity';

type MockSourcingLocations = {
  materials: Material[];
  sourcingLocations: SourcingLocation[];
  sourcingRecords: SourcingRecord[];
};

type MockSourcingLocationsWithIndicators = MockSourcingLocations & {
  indicators: Indicator[];
};

export const CreateSourcingLocationsWithImpact =
  async (): Promise<MockSourcingLocationsWithIndicators> => {
    const parentMaterial = await createMaterial({
      name: 'Parent Material',
    });
    const childMaterial = await createMaterial({
      parentId: parentMaterial.id,
      name: 'Child Material',
    });
    const supplier = await createSupplier();
    const businessUnit = await createBusinessUnit();
    const adminRegion = await createAdminRegion();
    const sourcingLocationParentMaterial = await createSourcingLocation({
      materialId: parentMaterial.id,
      producerId: supplier.id,
      businessUnitId: businessUnit.id,
      adminRegionId: adminRegion.id,
    });

    const sourcingLocationChildMaterial = await createSourcingLocation({
      materialId: childMaterial.id,
      producerId: supplier.id,
      businessUnitId: businessUnit.id,
      adminRegionId: adminRegion.id,
    });
    const unit = await createUnit();
    const indicators: Indicator[] = [];
    for (const indicator of Object.values(INDICATOR_NAME_CODES)) {
      indicators.push(
        await createIndicator({
          nameCode: indicator,
          name: indicator,
          unit,
          shortName: indicator,
        }),
      );
    }
    const sourcingRecords: SourcingRecord[] = [];
    for (const year of [2018, 2019, 2020, 2021, 2022, 2023]) {
      sourcingRecords.push(
        await createSourcingRecord({
          sourcingLocationId: sourcingLocationParentMaterial.id,
          year,
          tonnage: 100 * year,
        }),
      );
      sourcingRecords.push(
        await createSourcingRecord({
          sourcingLocationId: sourcingLocationChildMaterial.id,
          year,
          tonnage: 100 * year,
        }),
      );
    }
    for (const sourcingRecord of sourcingRecords) {
      for (const indicator of indicators) {
        await createIndicatorRecord({
          sourcingRecordId: sourcingRecord.id,
          indicatorId: indicator.id,
          value: sourcingRecord.tonnage * 2,
        });
      }
    }
    return {
      materials: [parentMaterial, childMaterial],
      indicators,
      sourcingRecords,
      sourcingLocations: [
        sourcingLocationParentMaterial,
        sourcingLocationChildMaterial,
      ],
    };
  };

export const CreateEUDRSourcingLocations =
  async (): Promise<MockSourcingLocations> => {
    const parentMaterial = await createMaterial({
      name: 'EUDR Parent Material',
    });
    const childMaterial = await createMaterial({
      parentId: parentMaterial.id,
      name: 'EUDR Child Material',
    });
    const supplier = await createSupplier();
    const businessUnit = await createBusinessUnit();
    const adminRegion = await createAdminRegion();
    const sourcingLocationParentMaterial = await createSourcingLocation({
      materialId: parentMaterial.id,
      producerId: supplier.id,
      businessUnitId: businessUnit.id,
      adminRegionId: adminRegion.id,
      locationType: LOCATION_TYPES.EUDR,
    });

    const sourcingLocationChildMaterial = await createSourcingLocation({
      materialId: childMaterial.id,
      producerId: supplier.id,
      businessUnitId: businessUnit.id,
      adminRegionId: adminRegion.id,
      locationType: LOCATION_TYPES.EUDR,
    });
    const unit = await createUnit();
    for (const indicator of Object.values(INDICATOR_NAME_CODES)) {
      await createIndicator({
        nameCode: indicator,
        name: indicator,
        unit,
        shortName: indicator,
      });
    }
    const sourcingRecords: SourcingRecord[] = [];
    for (const year of [2018, 2019, 2020, 2021, 2022, 2023]) {
      sourcingRecords.push(
        await createSourcingRecord({
          sourcingLocationId: sourcingLocationParentMaterial.id,
          year,
          tonnage: 100 * year,
        }),
      );
      sourcingRecords.push(
        await createSourcingRecord({
          sourcingLocationId: sourcingLocationChildMaterial.id,
          year,
          tonnage: 100 * year,
        }),
      );
    }
    return {
      materials: [parentMaterial, childMaterial],
      sourcingLocations: [
        sourcingLocationParentMaterial,
        sourcingLocationChildMaterial,
      ],
      sourcingRecords,
    };
  };
