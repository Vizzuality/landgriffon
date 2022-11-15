import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Material } from 'modules/materials/material.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import {
  Indicator,
  INDICATOR_TYPES_NEW,
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
import { h3DataMock } from '../e2e/h3-data/mocks/h3-data.mock';
import {
  h3IndicatorExampleDataFixture,
  h3MaterialExampleDataFixture,
} from '../e2e/h3-data/mocks/h3-fixtures';
import { getManager } from 'typeorm';

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
  indicator1: Indicator;
  indicator2: Indicator;
  indicator3: Indicator;
  indicator4: Indicator;
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

  // Creating 5 new indicators

  const indicator1: Indicator = await createIndicator({
    name: 'climate risk',
    nameCode: INDICATOR_TYPES_NEW.CLIMATE_RISK,
  });
  const indicator2: Indicator = await createIndicator({
    name: 'water use',
    nameCode: INDICATOR_TYPES_NEW.WATER_USE,
  });
  const indicator3: Indicator = await createIndicator({
    name: 'unsust water use',
    nameCode: INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE,
  });
  const indicator4: Indicator = await createIndicator({
    name: 'def risk',
    nameCode: INDICATOR_TYPES_NEW.DEFORESTATION_RISK,
  });

  await createIndicator({
    name: 'land use',
    nameCode: INDICATOR_TYPES_NEW.LAND_USE,
  });

  // Creating tables with h3Data for the new indicators

  const croplandAreaH3Data = await createH3Data({
    h3columnName: 'spam2010V2R0GlobalHAllA',
    h3tableName: 'h3_grid_spam2010v2r0_global_ha',
  });
  const weightedCarbonH3Data = await createH3Data({
    h3columnName: 'forestGhg2020Buffered',
    h3tableName: 'h3_grid_ghg_global',
  });
  const weightedDeforestationH3Data = await createH3Data({
    h3columnName: 'hansenLoss2020HaBuffered',
    h3tableName: 'h3_grid_deforestation_global',
  });
  const waterStressH3Data = await createH3Data({
    h3columnName: 'bwsCat',
    h3tableName: 'h3_grid_aqueduct_global',
  });

  for await (const H3Data of [
    croplandAreaH3Data,
    weightedCarbonH3Data,
    weightedDeforestationH3Data,
    waterStressH3Data,
  ]) {
    await getManager().query(
      `CREATE TABLE "${H3Data.h3tableName}" (h3index h3index, "${H3Data.h3columnName}" float4);`,
    );
    let query = `INSERT INTO ${H3Data.h3tableName} (h3index, "${H3Data.h3columnName}") VALUES `;
    const queryArr = [];
    for (const [key, value] of Object.entries(h3IndicatorExampleDataFixture)) {
      queryArr.push(`('${key}', ${value})`);
    }
    query = query.concat(queryArr.join());
    await getManager().query(query);
  }
  // creating h3 data for material to be able to get scaler for new indicator records

  const h3Material = await h3DataMock({
    h3TableName: 'fakeMaterialTable2002',
    h3ColumnName: 'fakeMaterialColumn2002',
    additionalH3Data: h3MaterialExampleDataFixture,
    year: 2002,
  });

  await createMaterialToH3(
    material1Descendant.id,
    h3Material.id,
    MATERIAL_TO_H3_TYPE.HARVEST,
  );

  await createMaterialToH3(
    material1Descendant.id,
    h3Material.id,
    MATERIAL_TO_H3_TYPE.PRODUCER,
  );

  await createMaterialToH3(
    material2.id,
    h3Material.id,
    MATERIAL_TO_H3_TYPE.HARVEST,
  );

  await createMaterialToH3(
    material2.id,
    h3Material.id,
    MATERIAL_TO_H3_TYPE.PRODUCER,
  );

  const sourcingRecord1: SourcingRecord = await createSourcingRecord({
    sourcingLocationId: sourcingLocation1.id,
    year: 2018,
    tonnage: 500,
  });

  await createIndicatorRecordForIntervention(
    {
      indicator: indicator1,
      value: 1200,
      scaler: 333,
    },
    sourcingRecord1,
  );

  await createIndicatorRecordForIntervention(
    {
      indicator: indicator2,
      value: 1200,
      scaler: 333,
    },
    sourcingRecord1,
  );

  await createIndicatorRecordForIntervention(
    {
      indicator: indicator3,
      value: 1200,
      scaler: 333,
    },
    sourcingRecord1,
  );

  await createIndicatorRecordForIntervention(
    {
      indicator: indicator4,
      value: 1100,
      scaler: 333,
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

  await createIndicatorRecordForIntervention(
    {
      indicator: indicator1,
      value: 2000,
      scaler: 222,
    },
    sourcingRecord2,
  );

  await createIndicatorRecordForIntervention(
    {
      indicator: indicator2,
      value: 2200,
      scaler: 222,
    },
    sourcingRecord2,
  );

  await createIndicatorRecordForIntervention(
    {
      indicator: indicator3,
      value: 2200,
    },
    sourcingRecord2,
  );

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
    indicator1,
    indicator2,
    indicator3,
    indicator4,
  };
}

export async function createInterventionPreconditionsWithMultipleYearRecords(): Promise<ScenarioInterventionPreconditions> {
  const scenarioInterventionPreconditions: ScenarioInterventionPreconditions =
    await createInterventionPreconditions();
  const newSourcingRecord1: SourcingRecord = await createSourcingRecord({
    sourcingLocationId: scenarioInterventionPreconditions.sourcingLocation1.id,
    year: 2019,
    tonnage: 550,
  });

  const newSourcingRecord2: SourcingRecord = await createSourcingRecord({
    sourcingLocationId: scenarioInterventionPreconditions.sourcingLocation2.id,
    year: 2019,
    tonnage: 650,
  });

  await createIndicatorRecordForIntervention(
    {
      indicator: scenarioInterventionPreconditions.indicator1,
      value: 2000,
    },
    newSourcingRecord1,
  );
  await createIndicatorRecordForIntervention(
    {
      indicator: scenarioInterventionPreconditions.indicator1,
      value: 2000,
    },
    newSourcingRecord2,
  );

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
