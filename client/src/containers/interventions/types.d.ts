import type { InterventionTypes, LocationStatus, LocationTypes } from './enums';
import type { SelectOption } from 'components/select/types';

export type IndicatorCoefficients = {
  DF_LUC_T: number;
  UWU_T: number;
  BL_LUC_T: number;
  GHG_LUC_T: number;
};

export type T1Supplier = {
  id: string;
  name: string;
};

export type Producer = {
  id: string;
  name: string;
};

export type AdminRegion = {
  id: string;
  name: string;
};

export type Intervention = {
  id: string;
  title: string;
  type: InterventionTypes;
  status: LocationStatus;
  percentage: number;
  startYear: number;
  replacedMaterials: { id: string; name: string }[];
  replacedBusinessUnits: { id: string; name: string }[];
  replacedSuppliers: T1Supplier[];
  replacedAdminRegions: AdminRegion[];
  newMaterial: { id: string; name: string };
  newBusinessUnit: { name: string };
  newAdminRegion: AdminRegion;
  newT1Supplier: T1Supplier;
  newProducer: Producer;
  newLocationType: LocationTypes;
  newLocationAddressInput?: string;
  newLocationCountryInput?: string;
  newLocationLatitudeInput?: string;
  newLocationLongitudeInput?: string;
  newIndicatorCoefficients: IndicatorCoefficients;
};

export type InterventionFormData = {
  interventionType: string;
  startYear: SelectOption<number>;
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
  cityAddressCoordinates: string;
  newLocationAddressInput?: string;
  newLocationLatitude?: number;
  newLocationLongitude?: number;

  newMaterialId?: SelectOption[];

  DF_LUC_T?: IndicatorCoefficients['DF_LUC_T'];
  UWU_T?: IndicatorCoefficients['UWU_T'];
  BL_LUC_T?: IndicatorCoefficients['BL_LUC_T'];
  GHG_LUC_T?: IndicatorCoefficients['GHG_LUC_T'];
};

export type InterventionDto = {
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
};
