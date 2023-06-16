export const REPLACED_ADMIN_REGIONS_TABLE_NAME: string =
  'replaced_admin_regions';

export const REPLACED_MATERIALS_TABLE_NAME: string = 'replaced_materials';

export const REPLACED_BUSINESS_UNITS_TABLE_NAME: string =
  'replaced_business_units';

export const REPLACED_T1SUPPLIERS_TABLE_NAME: string = 'replaced_suppliers';

export const REPLACED_PRODUCERS_TABLE_NAME: string = 'replaced_producers';

type interventionId = { scenarioInterventionId: string };

export type ReplacedAdminRegion = { adminRegionId: string } & interventionId;

export type ReplacedMaterial = { materialId: string } & interventionId;

export type ReplacedBusinessUnits = {
  businessUnitId: string;
} & interventionId;

export type ReplacedSuppliers = { supplierId: string } & interventionId;
