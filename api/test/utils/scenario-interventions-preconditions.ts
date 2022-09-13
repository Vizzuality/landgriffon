import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Material } from 'modules/materials/material.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import {
  Indicator,
  INDICATOR_TYPES,
} from 'modules/indicators/indicator.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import {
  createAdminRegion,
  createBusinessUnit,
  createH3Data,
  createIndicator,
  createIndicatorRecordForIntervention,
  createMaterial,
  createMaterialToH3,
  createScenario,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
} from '../entity-mocks';
import { MATERIAL_TO_H3_TYPE } from '../../src/modules/materials/material-to-h3.entity';

export interface ScenarioInterventionPreconditions {
  scenario: Scenario;
  material2: Material;
  material1: Material;
  material1Descendant: Material;
  supplier1: Supplier;
  supplier1Descendant: Supplier;
  supplier2: Supplier;
  adminRegion1: AdminRegion;
  adminRegion1Descendant: AdminRegion;
  adminRegion2: AdminRegion;
  businessUnit1: BusinessUnit;
  businessUnit1Descendant: BusinessUnit;
  businessUnit2: BusinessUnit;
  sourcingLocation1: SourcingLocation;
  sourcingLocation2: SourcingLocation;
}

export async function createInterventionPreconditions(): Promise<ScenarioInterventionPreconditions> {
  const scenario: Scenario = await createScenario();

  const material1: Material = await createMaterial();
  const material1Descendant = await createMaterial({
    name: 'Descendant Material',
    parent: material1,
  });
  const supplier1: Supplier = await createSupplier();
  const supplier1Descendant: Supplier = await createSupplier({
    name: 'Descendant Supplier',
    parent: supplier1,
  });
  const adminRegion1: AdminRegion = await createAdminRegion();
  const adminRegion1Descendant: AdminRegion = await createAdminRegion({
    name: 'Descendant region',
    parent: adminRegion1,
  });
  const businessUnit1: BusinessUnit = await createBusinessUnit();
  const businessUnit1Descendant: BusinessUnit = await createBusinessUnit({
    name: 'Descendant region',
    parent: businessUnit1,
  });

  const material2: Material = await createMaterial();
  const supplier2: Supplier = await createSupplier();
  const adminRegion2: AdminRegion = await createAdminRegion();
  const businessUnit2: BusinessUnit = await createBusinessUnit();

  const sourcingLocation1: SourcingLocation = await createSourcingLocation({
    materialId: material1Descendant.id,
    t1SupplierId: supplier1Descendant.id,
    businessUnitId: businessUnit1Descendant.id,
    adminRegionId: adminRegion1Descendant.id,
  });

  const indicator1: Indicator = await createIndicator({
    name: 'def',
    nameCode: INDICATOR_TYPES.CARBON_EMISSIONS,
  });
  const indicator2: Indicator = await createIndicator({
    name: 'carb',
    nameCode: INDICATOR_TYPES.BIODIVERSITY_LOSS,
  });
  const indicator3: Indicator = await createIndicator({
    name: 'biod',
    nameCode: INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
  });
  const indicator4: Indicator = await createIndicator({
    name: 'watr',
    nameCode: INDICATOR_TYPES.DEFORESTATION,
  });

  const h3data1 = await createH3Data({ indicatorId: indicator1.id });
  const h3data2 = await createH3Data({ indicatorId: indicator2.id });
  const h3data3 = await createH3Data({ indicatorId: indicator3.id });
  const h3data4 = await createH3Data({ indicatorId: indicator4.id });
  const harvest = await createMaterialToH3(
    material1Descendant.id,
    h3data1.id,
    MATERIAL_TO_H3_TYPE.HARVEST,
  );
  const producer = await createMaterialToH3(
    material1Descendant.id,
    h3data1.id,
    MATERIAL_TO_H3_TYPE.PRODUCER,
  );

  const harvest1 = await createMaterialToH3(
    material2.id,
    h3data1.id,
    MATERIAL_TO_H3_TYPE.HARVEST,
  );
  const producer1 = await createMaterialToH3(
    material2.id,
    h3data1.id,
    MATERIAL_TO_H3_TYPE.PRODUCER,
  );

  const sourcingRecord1: SourcingRecord = await createSourcingRecord({
    sourcingLocationId: sourcingLocation1.id,
    year: 2018,
    tonnage: 500,
  });
  const indicatorRecord1: IndicatorRecord =
    await createIndicatorRecordForIntervention(
      {
        indicator: indicator1,
        value: 1200,
      },
      sourcingRecord1,
    );

  const indicatorRecord2: IndicatorRecord =
    await createIndicatorRecordForIntervention(
      {
        indicator: indicator2,
        value: 1200,
      },
      sourcingRecord1,
    );

  const indicatorRecord3: IndicatorRecord =
    await createIndicatorRecordForIntervention(
      {
        indicator: indicator3,
        value: 1200,
      },
      sourcingRecord1,
    );

  const indicatorRecord4: IndicatorRecord =
    await createIndicatorRecordForIntervention(
      {
        indicator: indicator4,
        value: 1100,
      },
      sourcingRecord1,
    );

  const sourcingLocation2: SourcingLocation = await createSourcingLocation({
    materialId: material2.id,
    t1SupplierId: supplier2.id,
    businessUnitId: businessUnit2.id,
    adminRegionId: adminRegion2.id,
  });

  const sourcingRecord2: SourcingRecord = await createSourcingRecord({
    sourcingLocationId: sourcingLocation2.id,
    year: 2018,
    tonnage: 600,
  });

  const indicatorRecord5: IndicatorRecord =
    await createIndicatorRecordForIntervention(
      {
        indicator: indicator1,
        value: 2000,
      },
      sourcingRecord2,
    );

  const indicatorRecord6: IndicatorRecord =
    await createIndicatorRecordForIntervention(
      {
        indicator: indicator2,
        value: 2200,
      },
      sourcingRecord2,
    );

  const indicatorRecord7: IndicatorRecord =
    await createIndicatorRecordForIntervention(
      {
        indicator: indicator3,
        value: 2200,
      },
      sourcingRecord2,
    );

  const indicatorRecord8: IndicatorRecord =
    await createIndicatorRecordForIntervention(
      {
        indicator: indicator4,
        value: 2100,
      },
      sourcingRecord2,
    );

  return {
    scenario,
    material1,
    material1Descendant,
    material2,
    supplier1,
    supplier1Descendant,
    supplier2,
    adminRegion1,
    adminRegion1Descendant,
    adminRegion2,
    businessUnit1,
    businessUnit1Descendant,
    businessUnit2,
    sourcingLocation1,
    sourcingLocation2,
  };
}

export async function createInterventionPreconditionsWithMultipleYearRecords(): Promise<ScenarioInterventionPreconditions> {
  const scenarioInterventionPreconditions: ScenarioInterventionPreconditions =
    await createInterventionPreconditions();
  await createSourcingRecord({
    sourcingLocationId: scenarioInterventionPreconditions.sourcingLocation1.id,
    year: 2019,
    tonnage: 550,
  });

  await createSourcingRecord({
    sourcingLocationId: scenarioInterventionPreconditions.sourcingLocation2.id,
    year: 2019,
    tonnage: 650,
  });

  return scenarioInterventionPreconditions;
}

export async function createInterventionPreconditionsForSupplierChange(): Promise<ScenarioInterventionPreconditions> {
  const scenarioInterventionPreconditions: ScenarioInterventionPreconditions =
    await createInterventionPreconditionsWithMultipleYearRecords();

  const newSourcingLocation1: SourcingLocation = await createSourcingLocation({
    materialId: scenarioInterventionPreconditions.material1Descendant.id,
    t1SupplierId: scenarioInterventionPreconditions.supplier2.id,
    businessUnitId:
      scenarioInterventionPreconditions.businessUnit1Descendant.id,
    adminRegionId: scenarioInterventionPreconditions.adminRegion1Descendant.id,
  });

  await createSourcingRecord({
    sourcingLocationId: newSourcingLocation1.id,
    year: 2018,
    tonnage: 500,
  });

  await createSourcingRecord({
    sourcingLocationId: newSourcingLocation1.id,
    year: 2019,
    tonnage: 600,
  });

  return scenarioInterventionPreconditions;
}
