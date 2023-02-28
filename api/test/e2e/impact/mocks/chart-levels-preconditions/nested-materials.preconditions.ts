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

export async function createNestedMaterialsPreconditions(): Promise<{
  indicator: Indicator;
  rootMaterial: Material;
  materialsLevelOne: Material[];
  materialsLevelTwo: Material[];
}> {
  const rootMaterial: Material = await createMaterial({
    name: 'Root Material',
  });

  const levelOneMaterial1: Material = await createMaterial({
    name: 'Material Level One 1',
    parent: rootMaterial,
  });

  const levelOneMaterial2: Material = await createMaterial({
    name: 'Material Level One 2',
    parent: rootMaterial,
  });

  const levelTwoMaterial1: Material = await createMaterial({
    name: 'Material Level Two 1',
    parent: levelOneMaterial1,
  });

  const levelTwoMaterial2: Material = await createMaterial({
    name: 'Material Level Two 2',
    parent: levelOneMaterial1,
  });

  const levelTwoMaterial3: Material = await createMaterial({
    name: 'Material Level Two 3',
    parent: levelOneMaterial1,
  });

  const levelTwoMaterial4: Material = await createMaterial({
    name: 'Material Level Two 4',
    parent: levelOneMaterial2,
  });

  const levelTwoMaterial5: Material = await createMaterial({
    name: 'Material Level Two 5',
    parent: levelOneMaterial2,
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

  const t1Supplier: Supplier = await createSupplier({
    name: 'Supplier',
  });

  const adminRegion: AdminRegion = await createAdminRegion({
    name: 'Country',
    level: 0,
  });

  // Creating Sourcing Locations for Municipalities

  const materialsLevelTwo: Material[] = [
    levelTwoMaterial1,
    levelTwoMaterial2,
    levelTwoMaterial3,
    levelTwoMaterial4,
    levelTwoMaterial5,
  ];
  const sourcingLocations: SourcingLocation[] = [];

  for (let i = 0; i < materialsLevelTwo.length; i++) {
    sourcingLocations[i] = await createSourcingLocation({
      adminRegion,
      businessUnit,
      t1Supplier,
      material: materialsLevelTwo[i],
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
    rootMaterial,
    materialsLevelOne: [levelOneMaterial1, levelOneMaterial2],
    materialsLevelTwo: [
      levelTwoMaterial1,
      levelTwoMaterial2,
      levelTwoMaterial3,
    ],
  };
}
