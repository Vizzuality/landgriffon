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
  supplier1: Supplier;
  supplier2: Supplier;
  adminRegion1: AdminRegion;
  adminRegion2: AdminRegion;
  businessUnit1: BusinessUnit;
  businessUnit2: BusinessUnit;
  sourcingLocation1: SourcingLocation;
  sourcingLocation2: SourcingLocation;
}

export async function createInterventionPreconditions(): Promise<ScenarioInterventionPreconditions> {
  const scenario: Scenario = await createScenario();

  const material1: Material = await createMaterial();
  const supplier1: Supplier = await createSupplier();
  const adminRegion1: AdminRegion = await createAdminRegion();
  const businessUnit1: BusinessUnit = await createBusinessUnit();

  const material2: Material = await createMaterial();
  const supplier2: Supplier = await createSupplier();
  const adminRegion2: AdminRegion = await createAdminRegion();
  const businessUnit2: BusinessUnit = await createBusinessUnit();

  const sourcingLocation1: SourcingLocation = await createSourcingLocation({
    materialId: material1.id,
    t1SupplierId: supplier1.id,
    businessUnitId: businessUnit1.id,
    adminRegionId: adminRegion1.id,
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
    material2,
    supplier1,
    supplier2,
    adminRegion1,
    adminRegion2,
    businessUnit1,
    businessUnit2,
    sourcingLocation1,
    sourcingLocation2,
  };
}
