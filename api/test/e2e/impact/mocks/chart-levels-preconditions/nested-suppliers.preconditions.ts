import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { Unit } from 'modules/units/unit.entity';
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
} from '../../../../entity-mocks';
import { INDICATOR_TYPES } from 'modules/indicators/indicator.entity';

export async function createNestedSuppliersPreconditions(): Promise<{
  indicator: Indicator;
  rootSupplier: Supplier;
  suppliersLevelOne: Supplier[];
  suppliersLevelTwo: Supplier[];
}> {
  const rootSupplier: Supplier = await createSupplier({
    name: 'Root Supplier',
  });

  const levelOneSupplier1: Supplier = await createSupplier({
    name: 'Supplier Level One 1',
    parent: rootSupplier,
  });

  const levelOneSupplier2: Supplier = await createSupplier({
    name: 'Supplier Level One 2',
    parent: rootSupplier,
  });

  const levelTwoSupplier1: Supplier = await createSupplier({
    name: 'Supplier Level Two 1',
    parent: levelOneSupplier1,
  });

  const levelTwoSupplier2: Supplier = await createSupplier({
    name: 'Supplier Level Two 2',
    parent: levelOneSupplier1,
  });

  const levelTwoSupplier3: Supplier = await createSupplier({
    name: 'Supplier Level Two 3',
    parent: levelOneSupplier1,
  });

  const levelTwoSupplier4: Supplier = await createSupplier({
    name: 'Supplier Level Two 4',
    parent: levelOneSupplier2,
  });

  const levelTwoSupplier5: Supplier = await createSupplier({
    name: 'Supplier Level Two 5',
    parent: levelOneSupplier2,
  });

  const unit: Unit = await createUnit({
    name: 'defFakeUnit',
    shortName: 'fakeUnitDef',
  });
  const indicator: Indicator = await createIndicator({
    name: 'Deforestation',
    unit,
    nameCode: INDICATOR_TYPES.DEFORESTATION,
  });

  const businessUnit: BusinessUnit = await createBusinessUnit({
    name: 'Business Unit',
  });

  const material: Material = await createMaterial({
    name: 'Material',
  });

  const adminRegion: AdminRegion = await createAdminRegion({
    name: 'Country',
    level: 0,
  });

  // Creating Sourcing Locations for Municipalities

  const suppliersLevelTwo: Supplier[] = [
    levelTwoSupplier1,
    levelTwoSupplier2,
    levelTwoSupplier3,
    levelTwoSupplier4,
    levelTwoSupplier5,
  ];
  const sourcingLocations: SourcingLocation[] = [];

  for (let i = 0; i < suppliersLevelTwo.length; i++) {
    sourcingLocations[i] = await createSourcingLocation({
      adminRegion,
      businessUnit,
      material,
      t1Supplier: suppliersLevelTwo[i],
    });
  }

  for (const sourcingLocation of sourcingLocations) {
    const indicatorRecord: IndicatorRecord = await createIndicatorRecord({
      indicator,
      value: 1000,
    });
    await createSourcingRecord({
      year: 2020,
      indicatorRecords: [indicatorRecord],
      sourcingLocation,
    });
  }

  return {
    indicator,
    rootSupplier,
    suppliersLevelOne: [levelOneSupplier1, levelOneSupplier2],
    suppliersLevelTwo: [
      levelTwoSupplier1,
      levelTwoSupplier2,
      levelTwoSupplier3,
      levelTwoSupplier4,
      levelTwoSupplier5,
    ],
  };
}
