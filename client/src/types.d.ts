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
  metadata: Record<string, unknown>;
};
