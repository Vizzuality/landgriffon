import type { InterventionTypes, LocationStatus, LocationTypes } from './enums';
import type { Option } from 'components/forms/select';

export type IndicatorCoefficients = Record<string, number>;

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
  startYear: Option<number>;
  percentage: number;
  scenarioId: string;

  materialIds: Option[];
  businessUnitIds?: Option[];
  supplierIds?: Option[];
  adminRegionIds: Option[];

  newT1SupplierId?: Option;
  newProducerId?: Option;

  newLocationType?: Option;
  newLocationCountryInput?: Option;
  cityAddressCoordinates: string;
  newLocationAddressInput?: string;
  newLocationLatitude?: number;
  newLocationLongitude?: number;

  newMaterialId?: Option[];

  coefficients: IndicatorCoefficients;
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
