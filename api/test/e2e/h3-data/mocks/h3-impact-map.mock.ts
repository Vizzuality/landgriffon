import { Unit } from 'modules/units/unit.entity';
import { UnitConversion } from 'modules/unit-conversions/unit-conversion.entity';
import {
  Indicator,
  INDICATOR_NAME_CODES,
  INDICATOR_STATUS,
} from 'modules/indicators/indicator.entity';
import { h3DataMock } from './h3-data.mock';
import { Material, MATERIALS_STATUS } from 'modules/materials/material.entity';
import {
  createAdminRegion,
  createGeoRegion,
  createIndicatorRecord,
  createMaterial,
  createMaterialToH3,
  createScenario,
  createScenarioIntervention,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
} from '../../../entity-mocks';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import {
  LOCATION_TYPES,
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { MATERIAL_TYPE, EntityToH3 } from 'modules/h3-data/entity-to-h3.entity';
import { h3BasicFixtureForScaler } from './h3-fixtures';
import {
  SCENARIO_INTERVENTION_STATUS,
  ScenarioIntervention,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { DataSource } from 'typeorm';

export interface ImpactMapMockData {
  indicatorId: string;
  inactiveIndicatorId: string;
  unitId: string;
  adminRegionOneId: string;
  adminRegionTwoId: string;
  geoRegionOneId: string;
  geoRegionTwoId: string;
  t1SupplierOneId: string;
  t1SupplierTwoId: string;
  producerOneId: string;
  producerTwoId: string;
  inactiveMaterialId: string;
  materialOneId: string;
  materialTwoId: string;
  harvestH3DataOneId: string;
  harvestH3DataTwoId: string;
  scenarioId: string;
  scenarioTwoId: string;
  tablesToDrop: string[];
}

export const createImpactMapMockData = async (
  dataSource: DataSource,
): Promise<ImpactMapMockData> => {
  const tablesToDrop: string[] = [];

  const unit: Unit = new Unit();
  unit.name = 'test unit';
  unit.symbol = 'tonnes';
  await unit.save();

  const unitConversion: UnitConversion = new UnitConversion();
  unitConversion.unit = unit;
  unitConversion.factor = 1;
  await unitConversion.save();

  const indicator: Indicator = new Indicator();
  indicator.name = 'test indicator';
  indicator.unit = unit;
  indicator.nameCode = 'UWU_T' as INDICATOR_NAME_CODES;
  await indicator.save();

  const inactiveIndicator: Indicator = new Indicator();
  inactiveIndicator.name = 'Inactive Indicator';
  inactiveIndicator.unit = unit;
  inactiveIndicator.status = INDICATOR_STATUS.INACTIVE;
  inactiveIndicator.nameCode = 'INA_IN' as INDICATOR_NAME_CODES;
  await inactiveIndicator.save();

  const harvestH3Data = await h3DataMock(dataSource, {
    h3TableName: 'harvestTable',
    h3ColumnName: 'harvestColumn',
    additionalH3Data: h3BasicFixtureForScaler,
    indicatorId: indicator.id,
    year: 2020,
  });

  tablesToDrop.push(harvestH3Data.h3tableName);

  const productionH3Data = await h3DataMock(dataSource, {
    h3TableName: 'productionTable',
    h3ColumnName: 'productionColumn',
    additionalH3Data: h3BasicFixtureForScaler,
    indicatorId: indicator.id,
    year: 2020,
  });

  tablesToDrop.push(productionH3Data.h3tableName);

  const inactiveMaterial: Material = await createMaterial({
    name: 'Inactive Material',
    status: MATERIALS_STATUS.INACTIVE,
  });

  const materialOne: Material = await createMaterial({
    name: 'MaterialOne',
  });
  await createMaterialToH3(
    materialOne.id,
    productionH3Data.id,
    MATERIAL_TYPE.PRODUCER,
  );
  await createMaterialToH3(
    materialOne.id,
    harvestH3Data.id,
    MATERIAL_TYPE.HARVEST,
  );

  const geoRegionOne: GeoRegion = await createGeoRegion({
    h3Compact: ['861203a4fffffff', '861203a5fffffff'],
    h3Flat: ['861203a4fffffff', '861203a5fffffff'],
    h3FlatLength: 2,
  });

  const adminRegionOne: AdminRegion = await createAdminRegion({
    name: 'AdminRegionOne',
  });

  const t1SupplierOne: Supplier = await createSupplier({
    name: 'T1SupplierOne',
  });

  const producerSupplierOne: Supplier = await createSupplier({
    name: 'ProducerOne',
  });

  const sourcingLocationOne: SourcingLocation = await createSourcingLocation({
    adminRegion: adminRegionOne,
    geoRegion: geoRegionOne,
    material: materialOne,
    t1Supplier: t1SupplierOne,
    producer: producerSupplierOne,
    locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
  });

  const sourcingRecordOne: SourcingRecord = await createSourcingRecord({
    sourcingLocation: sourcingLocationOne,
  });

  await createIndicatorRecord({
    sourcingRecordId: sourcingRecordOne.id,
    indicatorId: indicator.id,
    materialH3DataId: harvestH3Data.id,
    scaler: 2000,
    value: 1234,
  });

  const materialTwo: Material = await createMaterial({
    name: 'MaterialTwo',
  });
  await createMaterialToH3(
    materialTwo.id,
    productionH3Data.id,
    MATERIAL_TYPE.PRODUCER,
  );
  await createMaterialToH3(
    materialTwo.id,
    harvestH3Data.id,
    MATERIAL_TYPE.HARVEST,
  );

  const geoRegionTwo: GeoRegion = await createGeoRegion({
    h3Compact: ['861203a4fffffff', '861203a6fffffff'],
    h3Flat: ['861203a4fffffff', '861203a6fffffff'],
    h3FlatLength: 2,
    name: 'DEF',
  });

  const adminRegionTwo: AdminRegion = await createAdminRegion({
    name: 'AdminRegionTwo',
  });

  const t1SupplierTwo: Supplier = await createSupplier({
    name: 'T1SupplierTwo',
  });

  const producerSupplierTwo: Supplier = await createSupplier({
    name: 'ProducerTwo',
  });

  const sourcingLocationTwo: SourcingLocation = await createSourcingLocation({
    adminRegion: adminRegionTwo,
    geoRegion: geoRegionTwo,
    material: materialTwo,
    t1Supplier: t1SupplierTwo,
    producer: producerSupplierTwo,
  });

  const sourcingRecordTwo: SourcingRecord = await createSourcingRecord({
    sourcingLocation: sourcingLocationTwo,
  });

  await createIndicatorRecord({
    sourcingRecordId: sourcingRecordTwo.id,
    indicatorId: indicator.id,
    materialH3DataId: harvestH3Data.id,
    scaler: 2000,
    value: 1000,
  });

  // Creating Sourcing Location belonging to Intervention - it should be ignored when calculating impact map
  // WITHOUT an scenarioId
  const scenario: Scenario = await createScenario({ title: 'testScenario' });

  const scenarioInterventionOne: ScenarioIntervention =
    await createScenarioIntervention({ scenario: scenario });

  const canceledSourcingLocationOne: SourcingLocation =
    await createSourcingLocation({
      scenarioInterventionId: scenarioInterventionOne.id,
      adminRegionId: adminRegionOne.id,
      geoRegionId: geoRegionOne.id,
      materialId: materialOne.id,
      t1SupplierId: t1SupplierOne.id,
      producerId: producerSupplierOne.id,
      locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  const cancelledSourcingRecordOne: SourcingRecord = await createSourcingRecord(
    {
      sourcingLocation: canceledSourcingLocationOne,
      tonnage: 100,
    },
  );

  await createIndicatorRecord({
    sourcingRecordId: cancelledSourcingRecordOne.id,
    indicatorId: indicator.id,
    materialH3DataId: harvestH3Data.id,
    scaler: 2000,
    value: -100,
  });

  const replacedSourcingLocationOne: SourcingLocation =
    await createSourcingLocation({
      scenarioInterventionId: scenarioInterventionOne.id,
      adminRegionId: adminRegionOne.id,
      geoRegionId: geoRegionOne.id,
      materialId: materialOne.id,
      t1SupplierId: t1SupplierOne.id,
      producerId: producerSupplierOne.id,
      locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
    });

  const replacedSourcingRecordOne: SourcingRecord = await createSourcingRecord({
    sourcingLocation: replacedSourcingLocationOne,
    tonnage: 100,
  });

  await createIndicatorRecord({
    sourcingRecordId: replacedSourcingRecordOne.id,
    indicatorId: indicator.id,
    materialH3DataId: harvestH3Data.id,
    scaler: 2000,
    value: 50,
  });

  // Inactive intervention for scenario one, should be ignored in all calculations
  const scenarioInterventionOneInactive: ScenarioIntervention =
    await createScenarioIntervention({
      scenario: scenario,
      status: SCENARIO_INTERVENTION_STATUS.INACTIVE,
    });

  const canceledSourcingLocationOneInactive: SourcingLocation =
    await createSourcingLocation({
      scenarioInterventionId: scenarioInterventionOneInactive.id,
      adminRegionId: adminRegionOne.id,
      geoRegionId: geoRegionOne.id,
      materialId: materialOne.id,
      t1SupplierId: t1SupplierOne.id,
      producerId: producerSupplierOne.id,
      locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  const cancelledSourcingRecordOneInactive: SourcingRecord =
    await createSourcingRecord({
      sourcingLocation: canceledSourcingLocationOneInactive,
      tonnage: 100,
    });

  await createIndicatorRecord({
    sourcingRecordId: cancelledSourcingRecordOneInactive.id,
    indicatorId: indicator.id,
    materialH3DataId: harvestH3Data.id,
    scaler: 2000,
    value: -123,
  });

  const replacedSourcingLocationOneInactive: SourcingLocation =
    await createSourcingLocation({
      scenarioInterventionId: scenarioInterventionOneInactive.id,
      adminRegionId: adminRegionOne.id,
      geoRegionId: geoRegionOne.id,
      materialId: materialOne.id,
      t1SupplierId: t1SupplierOne.id,
      producerId: producerSupplierOne.id,
      locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
    });

  const replacedSourcingRecordOneInactive: SourcingRecord =
    await createSourcingRecord({
      sourcingLocation: replacedSourcingLocationOneInactive,
      tonnage: 100,
    });

  await createIndicatorRecord({
    sourcingRecordId: replacedSourcingRecordOneInactive.id,
    indicatorId: indicator.id,
    materialH3DataId: harvestH3Data.id,
    scaler: 2000,
    value: 67,
  });

  //Intervention Two
  const scenarioInterventionTwo: ScenarioIntervention =
    await createScenarioIntervention({ scenario: scenario });

  const canceledSourcingLocationTwo: SourcingLocation =
    await createSourcingLocation({
      scenarioInterventionId: scenarioInterventionTwo.id,
      adminRegionId: adminRegionTwo.id,
      geoRegionId: geoRegionTwo.id,
      materialId: materialTwo.id,
      t1SupplierId: t1SupplierTwo.id,
      producerId: producerSupplierTwo.id,
      locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  const cancelledSourcingRecordTwo: SourcingRecord = await createSourcingRecord(
    {
      sourcingLocation: canceledSourcingLocationTwo,
      tonnage: 200,
    },
  );

  await createIndicatorRecord({
    sourcingRecordId: cancelledSourcingRecordTwo.id,
    indicatorId: indicator.id,
    materialH3DataId: harvestH3Data.id,
    scaler: 2000,
    value: -200,
  });

  const replacedSourcingLocationTwo: SourcingLocation =
    await createSourcingLocation({
      scenarioInterventionId: scenarioInterventionTwo.id,
      adminRegionId: adminRegionTwo.id,
      geoRegionId: geoRegionTwo.id,
      materialId: materialTwo.id,
      t1SupplierId: t1SupplierTwo.id,
      producerId: producerSupplierTwo.id,
      locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
    });

  const replacedSourcingRecordTwo: SourcingRecord = await createSourcingRecord({
    sourcingLocation: replacedSourcingLocationTwo,
    tonnage: 200,
  });

  await createIndicatorRecord({
    sourcingRecordId: replacedSourcingRecordTwo.id,
    indicatorId: indicator.id,
    materialH3DataId: harvestH3Data.id,
    scaler: 2000,
    value: 100,
  });

  //Scenario Two
  const scenarioTwo: Scenario = await createScenario({
    title: 'testScenario2',
  });

  const interventionScenarioTwo: ScenarioIntervention =
    await createScenarioIntervention({ scenario: scenarioTwo });

  const canceledSourcingLocationScenarioTwo: SourcingLocation =
    await createSourcingLocation({
      scenarioInterventionId: interventionScenarioTwo.id,
      adminRegionId: adminRegionOne.id,
      geoRegionId: geoRegionOne.id,
      materialId: materialOne.id,
      t1SupplierId: t1SupplierOne.id,
      producerId: producerSupplierOne.id,
      locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  const cancelledSourcingRecordScenarioTwo: SourcingRecord =
    await createSourcingRecord({
      sourcingLocation: canceledSourcingLocationScenarioTwo,
      tonnage: 100,
    });

  await createIndicatorRecord({
    sourcingRecordId: cancelledSourcingRecordScenarioTwo.id,
    indicatorId: indicator.id,
    materialH3DataId: harvestH3Data.id,
    scaler: 2000,
    value: -300,
  });

  const adminRegionThree: AdminRegion = await createAdminRegion({
    name: 'Chemical Plant Zone',
  });

  const geoRegionThree: GeoRegion = await createGeoRegion({
    h3Compact: ['861203a7fffffff'],
    h3Flat: ['861203a7fffffff'],
    h3FlatLength: 1,
    name: 'CPZ',
  });

  const replacedSourcingLocationScenarioTwo: SourcingLocation =
    await createSourcingLocation({
      scenarioInterventionId: interventionScenarioTwo.id,
      adminRegionId: adminRegionThree.id,
      geoRegionId: geoRegionThree.id,
      materialId: materialOne.id,
      t1SupplierId: t1SupplierOne.id,
      producerId: producerSupplierOne.id,
      locationType: LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
    });

  const replacedSourcingRecordScenarioTwo: SourcingRecord =
    await createSourcingRecord({
      sourcingLocation: replacedSourcingLocationScenarioTwo,
      tonnage: 100,
    });

  await createIndicatorRecord({
    sourcingRecordId: replacedSourcingRecordScenarioTwo.id,
    indicatorId: indicator.id,
    materialH3DataId: harvestH3Data.id,
    scaler: 1000,
    value: 150,
  });

  return {
    indicatorId: indicator.id,
    inactiveIndicatorId: inactiveIndicator.id,
    unitId: unit.id,
    geoRegionOneId: geoRegionOne.id,
    geoRegionTwoId: geoRegionTwo.id,
    adminRegionOneId: adminRegionOne.id,
    adminRegionTwoId: adminRegionTwo.id,
    t1SupplierOneId: t1SupplierOne.id,
    t1SupplierTwoId: t1SupplierTwo.id,
    producerOneId: producerSupplierOne.id,
    producerTwoId: producerSupplierTwo.id,
    inactiveMaterialId: inactiveMaterial.id,
    materialOneId: materialOne.id,
    materialTwoId: materialTwo.id,
    harvestH3DataOneId: harvestH3Data.id,
    harvestH3DataTwoId: harvestH3Data.id,
    scenarioId: scenario.id,
    scenarioTwoId: scenarioTwo.id,
    tablesToDrop,
  };
};

export const deleteImpactMapMockData = async (
  dataSource: DataSource,
): Promise<void> => {
  await dataSource.getRepository(EntityToH3).delete({});
  await dataSource.getRepository(Material).delete({});
  await dataSource.getRepository(H3Data).delete({});
  await dataSource.getRepository(Indicator).delete({});
  await dataSource.getRepository(IndicatorRecord).delete({});
  await dataSource.getRepository(UnitConversion).delete({});
  await dataSource.getRepository(Unit).delete({});
  await dataSource.getRepository(ScenarioIntervention).delete({});
  await dataSource.getRepository(Scenario).delete({});
};
