import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';
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
  createScenarioIntervention,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
  createUnit,
} from '../../../entity-mocks';
import { INDICATOR_TYPES } from '../../../../src/modules/indicators/indicator.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';

export async function createNewMaterialInterventionPreconditions(
  customScenario?: Scenario,
  customIndicator?: Indicator,
  customMaterials?: Record<string, Material>,
): Promise<{
  indicator: Indicator;
  scenarioIntervention: ScenarioIntervention;
  replacingMaterials: Record<string, Material>;
  replacedMaterials: Record<string, Material>;
}> {
  const adminRegion: AdminRegion = await createAdminRegion({
    name: 'India',
  });
  const unit: Unit = await createUnit({ shortName: 'fakeUnit' });
  const indicator: Indicator = customIndicator
    ? customIndicator
    : await createIndicator({
        name: 'Deforestation',
        unit,
        nameCode: INDICATOR_TYPES.DEFORESTATION,
      });

  const textile: Material = customMaterials
    ? customMaterials.textile
    : await createMaterial({ name: 'Textile' });

  const wool: Material = customMaterials
    ? customMaterials.wool
    : await createMaterial({
        name: 'Wool',
        parent: textile,
      });
  const cotton: Material = customMaterials
    ? customMaterials.cotton
    : await createMaterial({
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

  const supplier: Supplier = await createSupplier({
    name: 'Fake Supplier',
  });

  // Scenario pre-conditions

  const scenarioIntervention: ScenarioIntervention = customScenario
    ? await createScenarioIntervention({ scenario: customScenario })
    : await createScenarioIntervention();
  // Sourcing Locations - real ones

  const cottonSourcingLocation: SourcingLocation = await createSourcingLocation(
    {
      material: cotton,
      businessUnit,
      t1Supplier: supplier,
      adminRegion,
    },
  );

  const woolSourcingLocation: SourcingLocation = await createSourcingLocation({
    material: wool,
    businessUnit,
    t1Supplier: supplier,
    adminRegion,
  });

  // Sourcing Locations of Type cancelled (the one that will be replaced by Linen)

  const cottonSourcingLocationCancelled: SourcingLocation =
    await createSourcingLocation({
      material: cotton,
      businessUnit,
      t1Supplier: supplier,
      adminRegion,
      scenarioInterventionId: scenarioIntervention.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  const woolSourcingLocationCancelled: SourcingLocation =
    await createSourcingLocation({
      material: wool,
      businessUnit,
      t1Supplier: supplier,
      adminRegion,
      scenarioInterventionId: scenarioIntervention.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  // Sourcing location for the Replacing Material

  const linenSourcingLocationReplacing: SourcingLocation =
    await createSourcingLocation({
      material: linen,
      businessUnit,
      t1Supplier: supplier,
      adminRegion,
      scenarioInterventionId: scenarioIntervention.id,
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

  const indicatorRecordCottonCancelled: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: -800,
    });

  const indicatorRecordWoolCancelled: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: -1000,
    });

  const indicatorRecordLinenReplacing: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: 750,
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
    indicatorRecords: [indicatorRecordCottonCancelled],
    sourcingLocation: cottonSourcingLocationCancelled,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecordWoolCancelled],
    sourcingLocation: woolSourcingLocationCancelled,
  });

  // Sourcing Records + Indicator Records for Replacing Sourcing Location

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [indicatorRecordLinenReplacing],
    sourcingLocation: linenSourcingLocationReplacing,
  });

  return {
    indicator,
    scenarioIntervention,
    replacedMaterials: { wool, cotton },
    replacingMaterials: { linen },
  };
}
