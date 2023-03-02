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

export async function createChartLevelsPreconditions(): Promise<{
  indicator: Indicator;
  country: AdminRegion;
  provinces: AdminRegion[];
  municipalities: AdminRegion[];
}> {
  const country: AdminRegion = await createAdminRegion({
    name: 'Country',
    level: 0,
  });

  const provinceOne: AdminRegion = await createAdminRegion({
    name: 'Province 1',
    parent: country,
    level: 1,
  });

  const provinceTwo: AdminRegion = await createAdminRegion({
    name: 'Province 2',
    parent: country,
    level: 1,
  });

  const provinceThree: AdminRegion = await createAdminRegion({
    name: 'Province 3',
    parent: country,
    level: 1,
  });

  const municipalityOne: AdminRegion = await createAdminRegion({
    name: 'Municipality 1',
    parent: provinceOne,
    level: 2,
  });

  const municipalityTwo: AdminRegion = await createAdminRegion({
    name: 'Municipality 2',
    parent: provinceOne,
    level: 2,
  });

  const municipalityThree: AdminRegion = await createAdminRegion({
    name: 'Municipality 3',
    parent: provinceTwo,
    level: 2,
  });

  const municipalityFour: AdminRegion = await createAdminRegion({
    name: 'Municipality 4',
    parent: provinceTwo,
    level: 2,
  });

  const municipalityFive: AdminRegion = await createAdminRegion({
    name: 'Municipality 5',
    parent: provinceThree,
    level: 2,
  });

  const municipalitySix: AdminRegion = await createAdminRegion({
    name: 'Municipality 6',
    parent: provinceThree,
    level: 2,
  });

  const municipalitySeven: AdminRegion = await createAdminRegion({
    name: 'Municipality 7',
    parent: provinceThree,
    level: 2,
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

  const material: Material = await createMaterial({ name: 'Material' });

  const businessUnit: BusinessUnit = await createBusinessUnit({
    name: 'Business Unit',
  });

  const t1Supplier: Supplier = await createSupplier({
    name: 'Supplier',
  });

  // Creating Sourcing Locations for Municipalities

  const municipalities: AdminRegion[] = [
    municipalityOne,
    municipalityTwo,
    municipalityThree,
    municipalityFour,
    municipalityFive,
    municipalitySix,
    municipalitySeven,
  ];
  const sourcingLocations: SourcingLocation[] = [];

  for (let i = 0; i < municipalities.length; i++) {
    sourcingLocations[i] = await createSourcingLocation({
      material,
      businessUnit,
      t1Supplier,
      adminRegion: municipalities[i],
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
    country,
    provinces: [provinceOne, provinceTwo, provinceThree],
    municipalities: [municipalityOne, municipalityTwo, municipalityThree],
  };
}
