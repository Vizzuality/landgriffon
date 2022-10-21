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
} from '../../../../entity-mocks';
import { INDICATOR_TYPES } from '../../../../../src/modules/indicators/indicator.entity';

export async function createMixedScenariosPreconditions(): Promise<{
  indicator: Indicator;
  newScenarioChangeSupplier: Scenario;
  newScenarioChangeMaterial: Scenario;
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

  const oils: Material = await createMaterial({ name: 'Oils' });

  const palmOil: Material = await createMaterial({
    name: 'Palm Oil',
    parent: oils,
  });
  const oliveOil: Material = await createMaterial({
    name: 'Olive Oil',
    parent: oils,
  });

  const businessUnitClothes: BusinessUnit = await createBusinessUnit({
    name: 'Clothes',
  });

  const businessUnitFood: BusinessUnit = await createBusinessUnit({
    name: 'Food',
  });

  const supplierATextile: Supplier = await createSupplier({
    name: 'Supplier A Textile',
  });

  const supplierBTextile: Supplier = await createSupplier({
    name: 'Supplier B Textile',
  });

  const supplierAOils: Supplier = await createSupplier({
    name: 'Supplier A Oils',
  });

  const supplierBOils: Supplier = await createSupplier({
    name: 'Supplier B Oils',
  });

  // Scenario pre-conditions

  const newScenarioChangeSupplier: Scenario = await createScenario({
    title: 'Change of suppliers',
  });
  const newScenarioChangeMaterial: Scenario = await createScenario({
    title: 'Change of materials',
  });

  // Scenario Interventions pre-conditions

  const scenarioInterventionChangeSupplierTextile: ScenarioIntervention =
    await createScenarioIntervention({
      type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
      scenario: newScenarioChangeSupplier,
    });

  const scenarioInterventionChangeSupplierOil: ScenarioIntervention =
    await createScenarioIntervention({
      type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
      scenario: newScenarioChangeSupplier,
    });

  const scenarioInterventionChangeMaterialTextile: ScenarioIntervention =
    await createScenarioIntervention({
      type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
      scenario: newScenarioChangeMaterial,
    });

  const scenarioInterventionChangeMaterialOil: ScenarioIntervention =
    await createScenarioIntervention({
      type: SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
      scenario: newScenarioChangeMaterial,
    });

  // SOURCING LOCATIONS OF SCENARIOS

  // SCENARIO ONE - Change of suppliers

  // Change supplier for wool and cotton - canceled

  const sourcingLocationChangeSupplierTextileCanceledWool: SourcingLocation =
    await createSourcingLocation({
      material: wool,
      businessUnit: businessUnitClothes,
      t1Supplier: supplierATextile,
      producer: supplierATextile,
      adminRegion,
      scenarioInterventionId: scenarioInterventionChangeSupplierTextile.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  const sourcingLocationChangeSupplierTextileCanceledCotton: SourcingLocation =
    await createSourcingLocation({
      material: cotton,
      businessUnit: businessUnitClothes,
      t1Supplier: supplierATextile,
      producer: supplierATextile,
      adminRegion,
      scenarioInterventionId: scenarioInterventionChangeSupplierTextile.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  // Change supplier for wool and cotton - replacing

  const sourcingLocationChangeSupplierTextileReplacingWool: SourcingLocation =
    await createSourcingLocation({
      material: wool,
      businessUnit: businessUnitClothes,
      t1Supplier: supplierBTextile,
      producer: supplierATextile,
      adminRegion,
      scenarioInterventionId: scenarioInterventionChangeSupplierTextile.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
    });

  const sourcingLocationChangeSupplierTextileReplacingCotton: SourcingLocation =
    await createSourcingLocation({
      material: cotton,
      businessUnit: businessUnitClothes,
      t1Supplier: supplierBTextile,
      producer: supplierBTextile,
      adminRegion,
      scenarioInterventionId: scenarioInterventionChangeSupplierTextile.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
    });

  // Change supplier for oils - canceled

  const sourcingLocationChangeSupplierOilCanceledPalm: SourcingLocation =
    await createSourcingLocation({
      material: palmOil,
      businessUnit: businessUnitFood,
      t1Supplier: supplierAOils,
      adminRegion,
      scenarioInterventionId: scenarioInterventionChangeSupplierOil.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  // Change supplier for oil - replacing

  const sourcingLocationChangeSupplierOilReplacingPalm: SourcingLocation =
    await createSourcingLocation({
      material: palmOil,
      businessUnit: businessUnitFood,
      t1Supplier: supplierBOils,
      adminRegion,
      scenarioInterventionId: scenarioInterventionChangeSupplierOil.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
    });

  // SCENARIO TWO - Change of material

  // Change material for wool and cotton - canceled

  const sourcingLocationChangeMaterialTextileCanceledWool: SourcingLocation =
    await createSourcingLocation({
      material: wool,
      businessUnit: businessUnitClothes,
      t1Supplier: supplierATextile,
      producer: supplierATextile,
      adminRegion,
      scenarioInterventionId: scenarioInterventionChangeMaterialTextile.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  const sourcingLocationChangeMaterialTextileCanceledCotton: SourcingLocation =
    await createSourcingLocation({
      material: cotton,
      businessUnit: businessUnitClothes,
      t1Supplier: supplierATextile,
      producer: supplierATextile,
      adminRegion,
      scenarioInterventionId: scenarioInterventionChangeMaterialTextile.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  // Change material for wool and cotton - replacing

  const sourcingLocationChangeMaterialTextileReplacingLinen: SourcingLocation =
    await createSourcingLocation({
      material: linen,
      businessUnit: businessUnitClothes,
      t1Supplier: supplierATextile,
      producer: supplierATextile,
      adminRegion,
      scenarioInterventionId: scenarioInterventionChangeMaterialTextile.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
    });

  // Change material for oils - canceled

  const sourcingLocationChangeMaterialOilCanceledPalm: SourcingLocation =
    await createSourcingLocation({
      material: palmOil,
      businessUnit: businessUnitFood,
      t1Supplier: supplierAOils,
      adminRegion,
      scenarioInterventionId: scenarioInterventionChangeMaterialOil.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  // Change material for oils - replacing
  const sourcingLocationChangeMaterialOilReplacingOlive: SourcingLocation =
    await createSourcingLocation({
      material: oliveOil,
      businessUnit: businessUnitFood,
      t1Supplier: supplierAOils,
      adminRegion,
      scenarioInterventionId: scenarioInterventionChangeMaterialOil.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
    });

  // Creating Sourcing Records and Indicator Records for the Sourcing Locations

  // Change of Supplier (CoS) for textile:
  const irCoSCottonCanceled: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 1000,
  });

  const irCoSWoolCanceled: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 1200,
  });

  const irCoSCottonReplacing: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 500,
  });

  const irCoSWoolReplacing: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 600,
  });

  // Change of Supplier (CoS) for oils

  const irCoSPalmCanceled: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 2000,
  });

  const irCoSPalmReplacing: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 2500,
  });

  // Change of Material (CoM) for textiles:

  const irCoMCottonCanceled: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 1000,
  });

  const irCoMWoolCanceled: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 1200,
  });

  const irCoMLinenReplacing: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 1500,
  });

  // Change of Material (CoM) for oils:

  const irCoMPalmCanceled: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 2000,
  });

  const irCoMOliveReplacing: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 1500,
  });

  // Sourcing Records + Indicator Records for Change of Supplier Scenario

  // Textiles
  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoSCottonCanceled],
    sourcingLocation: sourcingLocationChangeSupplierTextileCanceledCotton,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoSWoolCanceled],
    sourcingLocation: sourcingLocationChangeSupplierTextileCanceledWool,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoSCottonReplacing],
    sourcingLocation: sourcingLocationChangeSupplierTextileReplacingCotton,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoSWoolReplacing],
    sourcingLocation: sourcingLocationChangeSupplierTextileReplacingWool,
  });

  // Oils

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoSPalmCanceled],
    sourcingLocation: sourcingLocationChangeSupplierOilCanceledPalm,
  });
  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoSPalmReplacing],
    sourcingLocation: sourcingLocationChangeSupplierOilReplacingPalm,
  });

  // Sourcing Records + Indicator Records for Change of Material Scenario

  // Textiles

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoMCottonCanceled],
    sourcingLocation: sourcingLocationChangeMaterialTextileCanceledCotton,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoMWoolCanceled],
    sourcingLocation: sourcingLocationChangeMaterialTextileCanceledWool,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoMLinenReplacing],
    sourcingLocation: sourcingLocationChangeMaterialTextileReplacingLinen,
  });

  // Oils

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoMPalmCanceled],
    sourcingLocation: sourcingLocationChangeMaterialOilCanceledPalm,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoMOliveReplacing],
    sourcingLocation: sourcingLocationChangeMaterialOilReplacingOlive,
  });

  return { indicator, newScenarioChangeSupplier, newScenarioChangeMaterial };
}
