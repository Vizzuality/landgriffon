import type { InterventionTypes, LocationTypes, LocationStatus } from './enums';

export type IndicatorCoefficients = {
  DF_LUC_T: number;
  UWU_T: number;
  BL_LUC_T: number;
  GHG_LUC_T: number;
};

export type Intervention = Readonly<{
  id: string;
  type: InterventionTypes;
  status: LocationStatus;
  startYear: number;
  replacedMaterials: { id: string; name: string }[];
  replacedBusinessUnits: { id: string; name: string }[];
  replacedSuppliers: { id: string; name: string }[];
  replacedAdminRegions: { id: string; name: string }[];
  newMaterial: unknown;
  newBusinessUnit: unknown;
  newAdminRegion: unknown;
}>;

export type InterventionDto = Readonly<{
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  status: LocationStatus;
  type: InterventionTypes;
  startYear?: number;
  endYear: number;
  percentage: number;
  scenarioId: string;
  materialIds: string[];
  businessUnitIds?: string[];
  supplierIds?: string[];
  adminRegionIds: string[];
  newT1SupplierId?: string;
  newProducerId?: string;
  newLocationType: LocationTypes;
  mewLocationCountryInput?: string;
  newIndicatorCoefficients: IndicatorCoefficients;
  newLocationAddressInput?: string;
  newLocationLatitude?: number;
  newLocationLongitude?: number;
  newMaterialId?: string;
  newMaterialTonnageRatio?: number;
}>;
