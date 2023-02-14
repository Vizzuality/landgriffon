import type { Permission, RoleName } from 'hooks/permissions/enums';
import type { Scenario } from 'containers/scenarios/types';

export type RGBColor = [number, number, number];

export type HEXColor = string;

export type ColorRamps = Record<string, HEXColor[]>;

/**
 * Allows to define a type that accepts a broader type and still allow intellisense for specific values.
 * For example, we might want to allow any string as a color, but still have intellisense for red, blue...
 */
type Autocomplete<Specific extends Broad, Broad = string> =
  | Specific
  | (Broad & Record<never, never>);

export type APIMetadataPagination = {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type APIpaginationRequest = {
  'page[size]': number;
  'page[number]': number;
};

export type H3Item = {
  c: RGBColor;
  h: string;
  v: number;
};

export type H3Data = H3Item[];

export type H3APIResponse = {
  data: H3Data;
  metadata: LayerMetadata;
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

export type WaterH3APIParams = MaterialH3APIParams & {
  indicatorId: string;
};

export type ImpactH3APIParams = CommonH3APIParams & {
  indicatorId: Indicator['id'];
  materialIds?: Material['id'][];
  originIds?: OriginRegion['id'][];
  supplierIds?: Supplier['id'][];
  scenarioId?: Scenario['id'];
  locationTypes?: string[];
};

export type ContextualH3APIParams = CommonH3APIParams;

export type ImpactTabularAPIParams = {
  groupBy: string;
  startYear: number;
  endYear: number;
  indicatorId: string;
  materialIds?: string[];
  originIds?: string[];
  supplierIds?: string[];
  locationTypes?: string[];
  scenarioId?: string;
};

type Unit = {
  description: string;
  id: string;
  name: string;
  shortName: string;
  symbol: string;
};

export interface IndicatorMetadata {
  name: string;
  units: string;
  source: string[];
  license: string;
  citation: string[];
  'name code': string;
  resolution: string;
  'short name': string;
  description: string;
  'indicator type': Autocomplete<`${'landscape' | 'farm'}-level`>;
  'date of content': `${number}-${number}`;
  'geographic coverage': Autocomplete<'Global coverage.'>;
  'frequency of updates': Autocomplete<'Annual'>;
}

export interface Indicator {
  id: string;
  name: string;
  nameCode: string;
  status: 'active' | 'inactive';
  type: 'indicators';
  unit?: Unit;
  metadata: IndicatorMetadata;
}

export type Group = {
  id: string;
  name: string;
};

export type Material = {
  id: string;
  hsCodeId: string;
  name: string;
  parentId: Material['id'];
  status: string | 'active';
  metadata: {
    cautions: string;
    citation: string;
    datasets: string[];
    'date of content': string;
    'frequency of updates': string;
    'geographic coverage': string;
    license: string;
    name: string;
    overview: string;
    resolution: string;
    source: string;
  };
};

export type MaterialTreeItem = {
  id: string;
  name: string;
  children: MaterialTreeItem[];
};

export type SourcingLocation = {
  materialId: string;
  material: string;
  t1Supplier: string;
  producer: string;
  businessUnit: string;
  country: string;
  locationType: string;
  // TODO: fix this
  // purchases: { year: number; tonnage: number }[];
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

type BusinessUnitsAttributes = Readonly<{
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
  attributes: BusinessUnitsAttributes;
};

type Metadata = {
  unit: string;
};

type AggregatedValues = Readonly<{
  aggregatedValues: { year: number; value: number }[];
  numberOfAggregatedEntities: number;
  sort: 'DES' | 'ASC';
}>;

export type PaginationMetadata = {
  page?: number;
  size?: number;
  totalItems?: number;
  totalPages?: number;
};

export type Role = {
  name: RoleName;
  permissions: { action: Permission }[];
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
  roles: Role[];
  id: string;
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
export type Layer = {
  id: string;
  isContextual: boolean;
  order?: number;
  active: boolean;
  visible: boolean;
  opacity: number;
  metadata?: WithRequiredProperty<Partial<LayerMetadata>, 'legend'>;
  loading?: boolean;
};

export type LegendItem = {
  value: string | number;
  color: string;
  label?: string;
};
export type LegendType = 'basic' | 'category' | 'choropleth' | 'gradient' | 'range';

export type Legend = {
  name: string;
  description?: string;
  id: string;
  unit: string;
  min: LegendItem['value'];
  items: LegendItem[];
  type: LegendType;
};

export type LayerMetadata = {
  $schema: string;
  name: string;
  description: string;
  license: string;
  source: string;
  legend: Legend;
  unit: string;
  quantiles: number[];
};

// Metadata info

export type METADATA_LAYERS = {
  material: string;
  'Livestock distribution': string;
  risk: string;
  'impact-e2c00251-fe31-4330-8c38-604535d795dc': string;
  'impact-633cf928-7c4f-41a3-99c5-e8c1bda0b323': string;
  'impact-c71eb531-2c8e-40d2-ae49-1049543be4d1': string;
  'impact-0594aba7-70a5-460c-9b58-fc1802d264ea': string;
  'Land impact': string;
};

export type METADATA_INTERVENTIONS = {
  supplier: string;
  location: string;
  impacts: string;
  material: string;
};

/**
 * Targets
 */
export type TargetYear = {
  year: number;
  value: number;
  percentage: number;
};

export type Target = {
  id: string;
  name: Indicator['name'];
  unit: Indicator['metadata']['unit'];
  indicatorId: Indicator['id'];
  baselineYear: number;
  baselineValue: number;
  years: TargetYear[];
};

// Helper types

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};

export type MakePropOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Task = {
  id: string;
  type: string;
  status: string;
  errors?: Record<string, string>[];
};

// User
export type User = {
  displayName: string;
  email: string;
  isActive: boolean;
};

export type UserPayload = {
  data: User[];
  meta: {
    pageSize: number;
    pageNumber: number;
    totalPages: number;
    totalItems: number;
  };
};
