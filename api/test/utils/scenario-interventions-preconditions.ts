import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Material } from 'modules/materials/material.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import {
  createAdminRegion,
  createBusinessUnit,
  createMaterial,
  createScenario,
  createSourcingLocation,
  createSourcingRecord,
  createSupplier,
} from '../entity-mocks';

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

  await createSourcingRecord({
    sourcingLocationId: sourcingLocation1.id,
    year: 2018,
    tonnage: 500,
  });

  const sourcingLocation2: SourcingLocation = await createSourcingLocation({
    materialId: material2.id,
    t1SupplierId: supplier2.id,
    businessUnitId: businessUnit2.id,
    adminRegionId: adminRegion2.id,
  });

  await createSourcingRecord({
    sourcingLocationId: sourcingLocation2.id,
    year: 2018,
    tonnage: 600,
  });

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
