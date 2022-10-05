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
import { INDICATOR_TYPES } from '../../../../src/modules/indicators/indicator.entity';

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
    nameCode: INDICATOR_TYPES.DEFORESTATION,
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

  const sourcingLocation1CanceledWool: SourcingLocation =
    await createSourcingLocation({
      material: wool,
      businessUnit,
      t1Supplier: supplierA,
      adminRegion,
      scenarioInterventionId: scenarioIntervention1.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  // Scenario Intervention 2 - Replace cotton with linen

  const sourcingLocation2CanceledCotton: SourcingLocation =
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

  const sourcingLocation1ReplacingWool: SourcingLocation =
    await createSourcingLocation({
      material: wool,
      businessUnit,
      t1Supplier: supplierB,
      producer: supplierA,
      adminRegion,
      scenarioInterventionId: scenarioIntervention1.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
    });

  const sourcingLocation2ReplacingLinen: SourcingLocation =
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
    value: 1500,
  });

  const indicatorRecord1CanceledWool: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: -1500,
    });

  const indicatorRecord2CanceledCotton: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: -1200,
    });

  const indicatorRecord1ReplacingWool: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: 950,
    });

  const indicatorRecord2ReplacingLinen: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: 1150,
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
    indicatorRecords: [indicatorRecord1CanceledWool],
    sourcingLocation: sourcingLocation1CanceledWool,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecord2CanceledCotton],
    sourcingLocation: sourcingLocation2CanceledCotton,
  });

  // Sourcing Records + Indicator Records for Replacing Sourcing Location

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecord1ReplacingWool],
    sourcingLocation: sourcingLocation1ReplacingWool,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecord2ReplacingLinen],
    sourcingLocation: sourcingLocation2ReplacingLinen,
  });

  return { indicator, newScenario };
}
