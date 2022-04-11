export type RGBColor = [number, number, number];

export type HEXColor = string;

export type ColorRamps = Record<string, HEXColor[]>;

export type APIMetadataPagination = {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type H3Item = {
  c: RGBColor;
  h: string;
  v: number;
};

export type H3Data = H3Item[] | [];

export type H3APIResponse = {
  data: H3Data;
  metadata: {
    quantiles: number[];
    unit: string;
  };
};

export type CommonH3APIParams = {
  year: number;
  resolution: number;
};

export type MaterialH3APIParams = CommonH3APIParams & {
  materialId: string;
};

export type RiskH3APIParams = MaterialH3APIParams & {
  indicatorId: string;
};

export type ImpactH3APIParams = CommonH3APIParams & {
  indicatorId: string;
  materialIds?: string[];
  originIds?: string[];
  supplierIds?: string[];
};

export type ImpactTabularAPIParams = {
  groupBy: string;
  startYear: number;
  endYear: number;
  indicatorId: string;
  materialIds?: string[];
  originIds?: string[];
  supplierIds?: string[];
};

export type Indicator = {
  id: string;
  name: string;
  value?: number;
  unit?: string;
};

export type Group = {
  id: string;
  name: string;
};

export type Material = {
  id: string;
  name: string;
  children: Material[];
};

export type SourcingLocation = {
  materialId: string;
  materialName: string;
  t1Supplier: string;
  producer: string;
  businessUnit: string;
  country: string;
  locationType: string;
  purchases: Record<string, integer>;
};

export type SourcingLocationsParams = {
  materialsData?: boolean;
  'page[size]'?: number;
  'page[number]'?: number;
};

export type Supplier = {
  id: string;
  name: string;
  children: Supplier[];
};

export type OriginRegion = {
  id: string;
  name: string;
  children: OriginRegion[];
};

type BusinessUnitsAtributes = Readonly<{
  name: string;
  description: string;
  status: 'inactive' | 'active';
  metadata: null;
}>;

export type BusinessUnits = {
  id: string;
  name: string;
  children: OriginRegion[];
  type: 'businessUnits';
  id: string;
  attributes: BusinessUnitsAtributes;
};

export type ImpactTableData = {
  groupBy: string;
  indicatorId: string;
  indicatorShortName: string;
  metadata: Record<string, unknown>;
  rows: {
    name: string;
    values: Record<string, number | string | boolean>[];
  }[];
  yearSum: {
    year: number;
    value: number;
  }[];
};

export type ImpactData = {
  data: {
    impactTable: ImpactTableData[];
  };
  meta: Record<string, unknown>;
};

/**
 * User profile
 */

// User profile payload for API, also for sign-up purposes
export type ProfilePayload = {
  fname?: string;
  lname?: string;
  email: string;
  password?: string;
};

// Password payload for API
export type PasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

/**
 * Generic response for all errors in API
 */
export type ErrorResponse = AxiosError<{
  errors: {
    status: string;
    title: string;
  }[];
}>;

/**
 * Layer
 */
export type LegendItem = {
  value: string | number;
  color: string;
};

export type Legend = {
  name: string;
  unit: string;
  min: LegendItem['value'];
  items: LegendItem[];
};

export type Layer = {
  id?: string;
  order?: number;
  active?: boolean;
  opacity?: number;
  legend?: Legend;
  loading?: boolean;
};
