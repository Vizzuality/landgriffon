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

export async function createChartLevelsPreconditions(): Promise<Indicator> {
  const country: AdminRegion = await createAdminRegion({
    name: 'Country',
  });

  const provinceOne: AdminRegion = await createAdminRegion({
    name: 'Province 1',
    parent: country,
  });

  const provinceTwo: AdminRegion = await createAdminRegion({
    name: 'Province 2',
    parent: country,
  });

  const provinceThree: AdminRegion = await createAdminRegion({
    name: 'Province 3',
    parent: country,
  });

  const municipalityOne: AdminRegion = await createAdminRegion({
    name: 'Municipality 1',
    parent: provinceOne,
  });

  const municipalityTwo: AdminRegion = await createAdminRegion({
    name: 'Municipality 2',
    parent: provinceOne,
  });

  const municipalityThree: AdminRegion = await createAdminRegion({
    name: 'Municipality 3',
    parent: provinceTwo,
  });

  const municipalityFour: AdminRegion = await createAdminRegion({
    name: 'Municipality 4',
    parent: provinceTwo,
  });

  const municipalityFive: AdminRegion = await createAdminRegion({
    name: 'Municipality 5',
    parent: provinceThree,
  });

  const municipalitySix: AdminRegion = await createAdminRegion({
    name: 'Municipality 6',
    parent: provinceThree,
  });

  const municipalitySeven: AdminRegion = await createAdminRegion({
    name: 'Municipality 7',
    parent: provinceThree,
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

  for (const municipality of municipalities) {
    const i: number = municipalities.indexOf(municipality);
    sourcingLocations[i] = await createSourcingLocation({
      material,
      businessUnit,
      t1Supplier,
      adminRegion: municipality,
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

  return indicator;
}
