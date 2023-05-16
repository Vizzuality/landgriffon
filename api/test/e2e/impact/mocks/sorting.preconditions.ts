import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
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
import { Unit } from 'modules/units/unit.entity';
import {
  Indicator,
  INDICATOR_TYPES,
} from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Supplier, SUPPLIER_TYPES } from 'modules/suppliers/supplier.entity';
import {
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import {
  SCENARIO_INTERVENTION_TYPE,
  ScenarioIntervention,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';

export async function createImpactTableSortingPreconditions(
  type: 'Normal' | 'ActualVsScenario' | 'ScenarioVsScenario',
): Promise<any> {
  const adminRegion: AdminRegion = await createAdminRegion({
    name: 'Fake AdminRegion',
  });
  const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
  const indicator: Indicator = await createIndicator({
    name: 'Fake Indicator',
    unit,
    nameCode: INDICATOR_TYPES.DEFORESTATION,
  });

  const parentMaterial1 = await createMaterial({
    name: 'Parent Fake Material 1',
  });
  const parentMaterial2 = await createMaterial({
    name: 'Parent Fake Material 2',
  });
  const parentMaterial3 = await createMaterial({
    name: 'Parent Fake Material 3',
  });
  const child11: Material = await createMaterial({
    name: 'Child Fake Material 1-1',
    parent: parentMaterial1,
  });
  const child12: Material = await createMaterial({
    name: 'Child Fake Material 1-2',
    parent: parentMaterial1,
  });
  const child13: Material = await createMaterial({
    name: 'Child Fake Material 1-3',
    parent: parentMaterial1,
  });

  const businessUnit: BusinessUnit = await createBusinessUnit({
    name: 'Fake Business Unit',
  });

  const supplier: Supplier = await createSupplier({
    name: 'Fake Supplier',
    type: SUPPLIER_TYPES.PRODUCER,
  });

  const parentLocations: SourcingLocation[] = await Promise.all(
    [parentMaterial1, parentMaterial2, parentMaterial3].map(
      async (material: Material) =>
        await createSourcingLocation({
          material: material,
          businessUnit,
          producer: supplier,
          adminRegion,
        }),
    ),
  );

  const childLocations: SourcingLocation[] = await Promise.all(
    [child11, child12, child13].map(
      async (material: Material) =>
        await createSourcingLocation({
          material: material,
          businessUnit,
          producer: supplier,
          adminRegion,
        }),
    ),
  );

  await indicatorSourcingRecord(2020, 0, indicator, parentLocations[0]);
  await indicatorSourcingRecord(2020, 200, indicator, parentLocations[1]);
  await indicatorSourcingRecord(2020, 150, indicator, parentLocations[2]);
  await indicatorSourcingRecord(2020, 30, indicator, childLocations[0]);
  await indicatorSourcingRecord(2020, 20, indicator, childLocations[1]);
  await indicatorSourcingRecord(2020, 50, indicator, childLocations[2]);
  await indicatorSourcingRecord(2021, 0, indicator, parentLocations[0]);
  await indicatorSourcingRecord(2021, 100, indicator, parentLocations[1]);
  await indicatorSourcingRecord(2021, 200, indicator, parentLocations[2]);
  await indicatorSourcingRecord(2021, 20, indicator, childLocations[0]);
  await indicatorSourcingRecord(2021, 90, indicator, childLocations[1]);
  await indicatorSourcingRecord(2021, 40, indicator, childLocations[2]);

  const result: any = {
    indicator,
    supplier,
    parentMaterials: [parentMaterial1, parentMaterial2, parentMaterial3],
    childMaterialParent1: [child11, child12, child13],
  };

  if (type === 'ActualVsScenario' || 'ScenarioVsScenario') {
    const scenario: Scenario = await createScenario({ title: 'scenario1' });

    const scenarioIntervention: ScenarioIntervention =
      await createScenarioIntervention({
        scenario,
        description: 'intervention 1',
        type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
      });

    const sharedLocationAdditionalData: Partial<SourcingLocation> = {
      businessUnit,
      producer: supplier,
      adminRegion,
      scenarioInterventionId: scenarioIntervention.id,
    };
    // Sourcing Locations of Type cancelled (the one that will be replaced by Linen)
    const [parent2Canceled, parent2Replacing] =
      await createSourceLocationsForIntervention({
        material: parentMaterial2,
        ...sharedLocationAdditionalData,
      });

    await indicatorSourcingRecord(2020, -200, indicator, parent2Canceled);
    await indicatorSourcingRecord(2020, 170, indicator, parent2Replacing);

    const [parent3Canceled, parent3Replacing] =
      await createSourceLocationsForIntervention({
        material: parentMaterial3,
        ...sharedLocationAdditionalData,
      });

    await indicatorSourcingRecord(2020, -150, indicator, parent3Canceled);
    await indicatorSourcingRecord(2020, 130, indicator, parent3Replacing);

    const [child11Canceled, child11Replacing] =
      await createSourceLocationsForIntervention({
        material: child11,
        ...sharedLocationAdditionalData,
      });

    await indicatorSourcingRecord(2020, -30, indicator, child11Canceled);
    await indicatorSourcingRecord(2020, 20, indicator, child11Replacing);

    const [child12Canceled, child12Replacing] =
      await createSourceLocationsForIntervention({
        material: child12,
        ...sharedLocationAdditionalData,
      });

    await indicatorSourcingRecord(2020, -20, indicator, child12Canceled);
    await indicatorSourcingRecord(2020, 15, indicator, child12Replacing);

    result.scenario = scenario;
  }

  if (type === 'ScenarioVsScenario') {
    const comparedScenario: Scenario = await createScenario({
      title: 'comparedScenario',
    });

    const scenarioIntervention: ScenarioIntervention =
      await createScenarioIntervention({
        scenario: comparedScenario,
        description: 'intervention 1 Compared scenario',
        type: SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY,
      });

    const sharedLocationAdditionalData: Partial<SourcingLocation> = {
      businessUnit,
      producer: supplier,
      adminRegion,
      scenarioInterventionId: scenarioIntervention.id,
    };
    // Sourcing Locations of Type cancelled (the one that will be replaced by Linen)
    const [parent2Canceled, parent2Replacing] =
      await createSourceLocationsForIntervention({
        material: parentMaterial2,
        ...sharedLocationAdditionalData,
      });

    await indicatorSourcingRecord(2020, -200, indicator, parent2Canceled);
    await indicatorSourcingRecord(2020, 150, indicator, parent2Replacing);

    const [parent3Canceled, parent3Replacing] =
      await createSourceLocationsForIntervention({
        material: parentMaterial3,
        ...sharedLocationAdditionalData,
      });

    await indicatorSourcingRecord(2020, -150, indicator, parent3Canceled);
    await indicatorSourcingRecord(2020, 140, indicator, parent3Replacing);

    const [child11Canceled, child11Replacing] =
      await createSourceLocationsForIntervention({
        material: child11,
        ...sharedLocationAdditionalData,
      });

    await indicatorSourcingRecord(2020, -30, indicator, child11Canceled);
    await indicatorSourcingRecord(2020, 25, indicator, child11Replacing);

    const [child12Canceled, child12Replacing] =
      await createSourceLocationsForIntervention({
        material: child12,
        ...sharedLocationAdditionalData,
      });

    await indicatorSourcingRecord(2020, -20, indicator, child12Canceled);
    await indicatorSourcingRecord(2020, 5, indicator, child12Replacing);

    result.comparedScenario = comparedScenario;
  }

  return result;
}

async function createSourceLocationsForIntervention(
  sharedLocationAdditionalData: Partial<SourcingLocation>,
): Promise<[SourcingLocation, SourcingLocation]> {
  const parent1CancelledLocation: SourcingLocation =
    await createSourcingLocation({
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
      ...sharedLocationAdditionalData,
    });

  const parent1ReplacingLocation: SourcingLocation =
    await createSourcingLocation({
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
      ...sharedLocationAdditionalData,
    });

  return [parent1CancelledLocation, parent1ReplacingLocation];
}

async function indicatorSourcingRecord(
  year: number,
  value: number,
  indicator: Indicator,
  sourcingLocation: SourcingLocation,
  tonnage: number = 100,
): Promise<void> {
  const indicatorRecord: IndicatorRecord = await createIndicatorRecord({
    value,
    indicator,
  });
  await createSourcingRecord({
    tonnage,
    year,
    indicatorRecords: [indicatorRecord],
    sourcingLocation,
  });
}
