import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import {
  SCENARIO_INTERVENTION_STATUS,
  ScenarioIntervention,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import {
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { Unit } from 'modules/units/unit.entity';
import {
  createAdminRegion,
  createBusinessUnit,
  createIndicator,
  createIndicatorRecord,
  createMaterial,
  createScenarioIntervention,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
  createUnit,
} from '../../../../entity-mocks';
import { INDICATOR_TYPES } from 'modules/indicators/indicator.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { ObjectLiteral } from 'typeorm';
import { v4 } from 'uuid';

export async function createNewCoefficientsInterventionPreconditions(
  customScenario?: Scenario,
): Promise<{
  indicator: Indicator;
  scenarioIntervention: ScenarioIntervention;
  entityIds: ObjectLiteral;
}> {
  // Creating Admin Regions
  const entityIds: ObjectLiteral = {};

  entityIds['India'] = v4();
  const adminRegion: AdminRegion = await createAdminRegion({
    name: 'India',
    id: entityIds['India'],
  });

  entityIds['Brazil'] = v4();
  const adminRegionBrazil: AdminRegion = await createAdminRegion({
    name: 'Brazil',
    id: entityIds['Brazil'],
  });

  // Creating Indicator
  const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
  const indicator: Indicator = await createIndicator({
    name: 'Deforestation',
    unit,
    nameCode: INDICATOR_TYPES.DEFORESTATION,
  });

  // Creating Materials
  entityIds['Textile'] = v4();
  const textile: Material = await createMaterial({
    name: 'Textile',
    id: entityIds['Textile'],
  });

  entityIds['Wool'] = v4();
  const wool: Material = await createMaterial({
    id: entityIds['Wool'],
    name: 'Wool',
    parent: textile,
  });
  entityIds['Cotton'] = v4();
  const cotton: Material = await createMaterial({
    id: entityIds['Cotton'],
    name: 'Cotton',
    parent: textile,
  });

  entityIds['Rubber'] = v4();
  const rubber: Material = await createMaterial({
    name: 'Rubber',
    id: entityIds['Rubber'],
  });

  // Creating Business Unit

  entityIds['Fake Business Unit'] = v4();
  const businessUnit: BusinessUnit = await createBusinessUnit({
    name: 'Fake Business Unit',
    id: entityIds['Fake Business Unit'],
  });

  // Creating Supplier

  entityIds['Fake Supplier'] = v4();
  const supplier: Supplier = await createSupplier({
    name: 'Fake Supplier',
    id: entityIds['Fake Supplier'],
  });

  // Scenario pre-conditions

  const scenarioIntervention: ScenarioIntervention = customScenario
    ? await createScenarioIntervention({ scenario: customScenario })
    : await createScenarioIntervention();

  const scenarioInterventionInactive: ScenarioIntervention = customScenario
    ? await createScenarioIntervention({
        scenario: customScenario,
        description: 'inactive intervention',
        status: SCENARIO_INTERVENTION_STATUS.INACTIVE,
      })
    : await createScenarioIntervention({
        description: 'inactive intervention',
        status: SCENARIO_INTERVENTION_STATUS.INACTIVE,
      });

  // Sourcing Locations - real ones

  const rubberSourcingLocation: SourcingLocation = await createSourcingLocation(
    {
      material: rubber,
      businessUnit,
      producer: supplier,
      adminRegion: adminRegionBrazil,
    },
  );

  const cottonSourcingLocation: SourcingLocation = await createSourcingLocation(
    {
      material: cotton,
      businessUnit,
      producer: supplier,
      adminRegion,
    },
  );

  const woolSourcingLocation: SourcingLocation = await createSourcingLocation({
    material: wool,
    businessUnit,
    producer: supplier,
    adminRegion,
  });

  // Sourcing Locations belonging to Intervention - Cotton

  const cottonSourcingLocationCancelled: SourcingLocation =
    await createSourcingLocation({
      material: cotton,
      businessUnit,
      producer: supplier,
      adminRegion,
      scenarioInterventionId: scenarioIntervention.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  const cottonSourcingLocationReplacing: SourcingLocation =
    await createSourcingLocation({
      material: cotton,
      businessUnit,
      producer: supplier,
      adminRegion,
      scenarioInterventionId: scenarioIntervention.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
    });

  // Sourcing Locations belonging to Intervention - Wool

  const woolSourcingLocationCancelled: SourcingLocation =
    await createSourcingLocation({
      material: wool,
      businessUnit,
      producer: supplier,
      adminRegion,
      scenarioInterventionId: scenarioIntervention.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  const woolSourcingLocationReplacing: SourcingLocation =
    await createSourcingLocation({
      material: wool,
      businessUnit,
      producer: supplier,
      adminRegion,
      scenarioInterventionId: scenarioIntervention.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
    });

  // Sourcing Locations belonging to Inactive Intervention
  const woolSourcingLocationCancelledInactive: SourcingLocation =
    await createSourcingLocation({
      material: wool,
      businessUnit,
      producer: supplier,
      adminRegion,
      scenarioInterventionId: scenarioInterventionInactive.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  const woolSourcingLocationReplacingInactive: SourcingLocation =
    await createSourcingLocation({
      material: wool,
      businessUnit,
      producer: supplier,
      adminRegion,
      scenarioInterventionId: scenarioInterventionInactive.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
    });

  // Creating Sourcing Records and Indicator Records for the Sourcing Locations

  const indicatorRecordCottonReplacing: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: 400,
    });
  const indicatorRecordWoolReplacing: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: 500,
    });
  const indicatorRecordWoolReplacingInactive: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: 200,
    });

  const indicatorRecordCotton: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 1200,
  });

  const indicatorRecordWool: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 1500,
  });

  const indicatorRecordCottonCancelled: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: -600,
    });

  const indicatorRecordWoolCancelled: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: -750,
    });

  const indicatorRecordWoolCancelledInactive: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: -234,
    });

  const indicatorRecordRubber: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 3000,
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

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecordRubber],
    sourcingLocation: rubberSourcingLocation,
  });

  // Sourcing Records + Indicator Records for Canceled Sourcing Locations

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecordCottonCancelled],
    sourcingLocation: cottonSourcingLocationCancelled,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecordWoolCancelled],
    sourcingLocation: woolSourcingLocationCancelled,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecordWoolCancelledInactive],
    sourcingLocation: woolSourcingLocationCancelledInactive,
  });

  // Sourcing Records + Indicator Records for Replacing Sourcing Locations

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecordCottonReplacing],
    sourcingLocation: cottonSourcingLocationReplacing,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecordWoolReplacing],
    sourcingLocation: woolSourcingLocationReplacing,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecordWoolReplacingInactive],
    sourcingLocation: woolSourcingLocationReplacingInactive,
  });

  return { indicator, scenarioIntervention, entityIds };
}
