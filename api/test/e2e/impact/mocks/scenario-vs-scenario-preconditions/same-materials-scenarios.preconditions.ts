import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { Material } from 'modules/materials/material.entity';
import {
  INTERVENTION_STATUS,
  INTERVENTION_TYPE,
  Intervention,
} from 'modules/interventions/intervention.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
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
  createScenario,
  createScenarioIntervention,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
  createUnit,
} from '../../../../entity-mocks';
import { INDICATOR_TYPES } from 'modules/indicators/indicator.entity';

export async function createSameMaterialScenariosPreconditions(): Promise<{
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

  const businessUnitClothes: BusinessUnit = await createBusinessUnit({
    name: 'Clothes',
  });

  const supplierATextile: Supplier = await createSupplier({
    name: 'Supplier A Textile',
  });

  const supplierBTextile: Supplier = await createSupplier({
    name: 'Supplier B Textile',
  });

  // Scenario pre-conditions

  const newScenarioChangeSupplier: Scenario = await createScenario({
    title: 'Change of suppliers',
  });
  const newScenarioChangeMaterial: Scenario = await createScenario({
    title: 'Change of materials',
  });

  // Scenario Interventions pre-conditions

  const scenarioInterventionChangeSupplierTextile: Intervention =
    await createScenarioIntervention({
      type: INTERVENTION_TYPE.NEW_SUPPLIER,
      scenario: newScenarioChangeSupplier,
    });
  const scenarioInterventionChangeSupplierTextileInactive: Intervention =
    await createScenarioIntervention({
      type: INTERVENTION_TYPE.NEW_SUPPLIER,
      scenario: newScenarioChangeSupplier,
      status: INTERVENTION_STATUS.INACTIVE,
    });

  const scenarioInterventionChangeMaterialTextile: Intervention =
    await createScenarioIntervention({
      type: INTERVENTION_TYPE.NEW_MATERIAL,
      scenario: newScenarioChangeMaterial,
    });
  const scenarioInterventionChangeMaterialTextileInactive: Intervention =
    await createScenarioIntervention({
      type: INTERVENTION_TYPE.NEW_MATERIAL,
      scenario: newScenarioChangeMaterial,
      status: INTERVENTION_STATUS.INACTIVE,
    });

  // SOURCING LOCATIONS - REAL ONES

  const sourcingLocationWool: SourcingLocation = await createSourcingLocation({
    material: wool,
    businessUnit: businessUnitClothes,
    t1Supplier: supplierATextile,
    producer: supplierATextile,
    adminRegion,
  });

  const sourcingLocationCotton: SourcingLocation = await createSourcingLocation(
    {
      material: cotton,
      businessUnit: businessUnitClothes,
      t1Supplier: supplierATextile,
      producer: supplierATextile,
      adminRegion,
    },
  );

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

  const sourcingLocationChangeSupplierTextileCanceledCottonInactive: SourcingLocation =
    await createSourcingLocation({
      material: cotton,
      businessUnit: businessUnitClothes,
      t1Supplier: supplierATextile,
      producer: supplierATextile,
      adminRegion,
      scenarioInterventionId:
        scenarioInterventionChangeSupplierTextileInactive.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  // Change supplier for wool and cotton - replacing

  const sourcingLocationChangeSupplierTextileReplacingWool: SourcingLocation =
    await createSourcingLocation({
      material: wool,
      businessUnit: businessUnitClothes,
      t1Supplier: supplierBTextile,
      producer: supplierBTextile,
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

  const sourcingLocationChangeSupplierTextileReplacingCottonInactive: SourcingLocation =
    await createSourcingLocation({
      material: cotton,
      businessUnit: businessUnitClothes,
      t1Supplier: supplierBTextile,
      producer: supplierBTextile,
      adminRegion,
      scenarioInterventionId:
        scenarioInterventionChangeSupplierTextileInactive.id,
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

  const sourcingLocationChangeMaterialTextileCanceledCottonInactive: SourcingLocation =
    await createSourcingLocation({
      material: cotton,
      businessUnit: businessUnitClothes,
      t1Supplier: supplierATextile,
      producer: supplierATextile,
      adminRegion,
      scenarioInterventionId:
        scenarioInterventionChangeMaterialTextileInactive.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
    });

  // Change material for linen instead of wool and cotton - replacing

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

  const sourcingLocationChangeMaterialTextileReplacingLinenInactive: SourcingLocation =
    await createSourcingLocation({
      material: linen,
      businessUnit: businessUnitClothes,
      t1Supplier: supplierATextile,
      producer: supplierATextile,
      adminRegion,
      scenarioInterventionId:
        scenarioInterventionChangeMaterialTextileInactive.id,
      interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
    });

  // Creating Sourcing Records and Indicator Records for the Sourcing Locations

  // Real Indicator Records:

  const irCotton: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 1000,
  });

  const irWool: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 1200,
  });

  // Change of Supplier (CoS) for textile:
  const irCoSCottonCanceled: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: -500,
  });

  const irCoSWoolCanceled: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: -600,
  });

  const irCoSCottonCanceledInactive: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: -234,
    });

  const irCoSCottonReplacing: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 400,
  });

  const irCoSWoolReplacing: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 500,
  });

  const irCoSCottonReplacingInactive: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: 345,
    });

  // Change of Material (CoM) for textiles:

  const irCoMCottonCanceled: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: -1000,
  });

  const irCoMWoolCanceled: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: -1200,
  });

  const irCoMCottonCanceledInactive: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: -123,
    });

  const irCoMLinenReplacing: IndicatorRecord = await createIndicatorRecord({
    indicator,
    value: 1500,
  });
  const irCoMLinenReplacingInactive: IndicatorRecord =
    await createIndicatorRecord({
      indicator,
      value: 234,
    });

  // Sourcing Records + Indicator Records - real ones

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCotton],
    sourcingLocation: sourcingLocationCotton,
    tonnage: 400,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irWool],
    sourcingLocation: sourcingLocationWool,
    tonnage: 400,
  });

  // Sourcing Records + Indicator Records for Change of Supplier Scenario

  // Textiles
  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoSCottonCanceled],
    sourcingLocation: sourcingLocationChangeSupplierTextileCanceledCotton,
    tonnage: 200,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoSCottonCanceledInactive],
    sourcingLocation:
      sourcingLocationChangeSupplierTextileCanceledCottonInactive,
    tonnage: 200,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoSWoolCanceled],
    sourcingLocation: sourcingLocationChangeSupplierTextileCanceledWool,
    tonnage: 200,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoSCottonReplacing],
    sourcingLocation: sourcingLocationChangeSupplierTextileReplacingCotton,
    tonnage: 200,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoSCottonReplacingInactive],
    sourcingLocation:
      sourcingLocationChangeSupplierTextileReplacingCottonInactive,
    tonnage: 200,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoSWoolReplacing],
    sourcingLocation: sourcingLocationChangeSupplierTextileReplacingWool,
    tonnage: 200,
  });

  // Sourcing Records + Indicator Records for Change of Material Scenario

  // Textiles

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoMCottonCanceled],
    sourcingLocation: sourcingLocationChangeMaterialTextileCanceledCotton,
    tonnage: 300,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoMCottonCanceledInactive],
    sourcingLocation:
      sourcingLocationChangeMaterialTextileCanceledCottonInactive,
    tonnage: 300,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoMWoolCanceled],
    sourcingLocation: sourcingLocationChangeMaterialTextileCanceledWool,
    tonnage: 300,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoMLinenReplacing],
    sourcingLocation: sourcingLocationChangeMaterialTextileReplacingLinen,
    tonnage: 300,
  });

  await createSourcingRecord({
    year: 2020,
    indicatorRecords: [irCoMLinenReplacingInactive],
    sourcingLocation:
      sourcingLocationChangeMaterialTextileReplacingLinenInactive,
    tonnage: 300,
  });

  return { indicator, newScenarioChangeSupplier, newScenarioChangeMaterial };
}
