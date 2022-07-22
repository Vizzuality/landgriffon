import type { InterventionTypes, LocationStatus } from './enums';
import type { SelectOption } from 'components/select/types';

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
  newMaterial: { name: string };
  newBusinessUnit: { name: string };
  newAdminRegion: { name: string };
}>;

export type InterventionFormData = Readonly<{
  interventionType: string;
  startYear: SelectOption;
  percentage: number;
  scenarioId: string;

  materialIds: SelectOption[];
  businessUnitIds?: SelectOption[];
  supplierIds?: SelectOption[];
  adminRegionIds: SelectOption[];

  newT1SupplierId?: SelectOption;
  newProducerId?: SelectOption;

  newLocationType?: SelectOption;
  newLocationCountryInput?: SelectOption;
  newLocationAddressInput?: string;
  newLocationLatitude?: number;
  newLocationLongitude?: number;

  newMaterialId?: SelectOption;

  DF_LUC_T?: number;
  UWU_T?: number;
  BL_LUC_T?: number;
  GHG_LUC_T?: number;
}>;

export type InterventionDto = Readonly<{
  id?: number;
  title?: string;
  description?: string;
  status?: string;
  type: string;
  startYear: number;
  endYear?: number;
  percentage: number;
  scenarioId: string;

  materialIds: string[];
  businessUnitIds?: string[];
  supplierIds?: string[];
  adminRegionIds: string[];

  newT1SupplierId?: string;
  newProducerId?: string;

  newLocationType: string;
  newLocationCountryInput?: string;
  newIndicatorCoefficients?: IndicatorCoefficients;
  newLocationAddressInput?: string;
  newLocationLatitude?: number;
  newLocationLongitude?: number;

  newMaterialId?: string;
  newMaterialTonnageRatio?: number;
}>;
