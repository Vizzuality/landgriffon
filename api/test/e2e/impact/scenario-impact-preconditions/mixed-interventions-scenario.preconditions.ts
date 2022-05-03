import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import {
  ScenarioIntervention,
  SCENARIO_INTERVENTION_TYPE,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import {
  SourcingLocation,
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { Unit } from 'modules/units/unit.entity';
import {
  createAdminRegion,
  createBusinessUnit,
  createIndicator,
  createIndicatorRecord,
  createMaterial,
  createScenario,
  createScenarioIntervention,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
  createUnit,
} from '../../../entity-mocks';

export async function createMultipleInterventionsPreconditions(): Promise<{
  indicator: Indicator;
  newScenario: Scenario;
}> {
  const adminRegion: AdminRegion = await createAdminRegion({
    name: 'India',
  });
  const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
  const indicator: Indicator = await createIndicator({
    name: 'Deforestation',
    unit,
  });

  const textile: Material = await createMaterial({ name: 'Textile' });

  const wool: Material = await createMaterial({
    name: 'Wool',
    parent: textile,
  });
  const cotton: Material = await createMaterial({
    name: 'Cotton',
    parent: textile,
  });

  const linen: Material = await createMaterial({
    name: 'Linen',
    parent: textile,
  });

  const businessUnit: BusinessUnit = await createBusinessUnit({
    name: 'Fake Business Unit',
  });

  const supplierA: Supplier = await createSupplier({
    name: 'Supplier A',
  });

  const supplierB: Supplier = await createSupplier({
    name: 'Supplier B',
  });

  // Scenario and Scenario Interventions pre-conditions

  const newScenario: Scenario = await createScenario();

  const scenarioIntervention1: ScenarioIntervention =
    await createScenarioIntervention({
      type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
      scenario: newScenario,
    });

  const scenarioIntervention2: ScenarioIntervention =
    await createScenarioIntervention({
      type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
      scenario: newScenario,
    });

  // Sourcing Locations - real ones

  const cottonSourcingLocation: SourcingLocation = await createSourcingLocation(
    {
      material: cotton,
      businessUnit,
      t1Supplier: supplierA,
      adminRegion,
    },
  );

  const woolSourcingLocation: SourcingLocation = await createSourcingLocation({
    material: wool,
    businessUnit,
    t1Supplier: supplierB,
    adminRegion,
  });

  // SOURCING LOCATIONS OF TYPE CANCELLED

  // Scenario Intervention 1 - Change supplier for wool

  const sourcingLocation1Cancelled: SourcingLocation =
    await createSourcingLocation({
      material: wool,
      businessUnit,
      t1Supplier: supplierA,
      adminRegion,
      scenarioInterventionId: scenarioIntervention1.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  // Scenario Intervention 2 - Replace cotton with linen

  const sourcingLocation2Cancelled: SourcingLocation =
    await createSourcingLocation({
      material: cotton,
      businessUnit,
      t1Supplier: supplierA,
      adminRegion,
      scenarioInterventionId: scenarioIntervention2.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  // SOURCING LOCATIONS OF TYPE REPLACING

  // Scenario Intervention 1 - Change supplier for wool

  const sourcingLocation1Replacing: SourcingLocation =
    await createSourcingLocation({
      material: wool,
      businessUnit,
      t1Supplier: supplierB,
      adminRegion,
      scenarioInterventionId: scenarioIntervention1.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
    });

  const sourcingLocation2Replacing: SourcingLocation =
    await createSourcingLocation({
      material: linen,
      businessUnit,
      t1Supplier: supplierB,
      adminRegion,
      scenarioInterventionId: scenarioIntervention2.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
    });

  // Creating Sourcing Records and Indicator Records for the Sourcing Locations

  const indicatorRecordCotton: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 1200,
  });

  const indicatorRecordWool: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 1200,
  });

  const indicatorRecord1Cancelled: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: 1200,
    });

  const indicatorRecord2Cancelled: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: 1100,
    });

  const indicatorRecord1Replacing: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: 1000,
    });

  const indicatorRecord2Replacing: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: 900,
    });

  // Sourcing Records + Indicator Records for Real Sourcing Locations

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecordCotton],
    sourcingLocation: cottonSourcingLocation,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecordWool],
    sourcingLocation: woolSourcingLocation,
  });

  // Sourcing Records + Indicator Records for Canceled Sourcing Locations

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecord1Cancelled],
    sourcingLocation: sourcingLocation1Cancelled,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecord2Cancelled],
    sourcingLocation: sourcingLocation2Cancelled,
  });

  // Sourcing Records + Indicator Records for Replacing Sourcing Location

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecord1Replacing],
    sourcingLocation: sourcingLocation1Replacing,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecord2Replacing],
    sourcingLocation: sourcingLocation2Replacing,
  });

  return { indicator, newScenario };
}
