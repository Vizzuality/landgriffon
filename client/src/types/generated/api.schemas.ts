/**
 * Generated by orval v6.27.1 🍺
 * Do not edit manually.
 * LandGriffon API
 * LandGriffon is a conservation planning platform.
 * OpenAPI spec version: 0.2.0
 */
export type UsersControllerFindAllParams = {
  /**
   * A comma-separated list of relationship paths. Allows the client to customize which related resources should be returned. Allowed values are: `projects`.
   */
  include?: string;
  /**
   * An array of filters (e.g. `filter[keyA]=<value>&filter[keyB]=<value1>,<value2>...`). Allows the client to request for specific filtering criteria to be applied to the request. Semantics of each set of filter key/values and of the set of filters as a whole depend on the specific request.
   */
  filter?: string[];
  /**
   * A comma-separated list that refers to the name(s) of the fields to be returned. An empty value indicates that all fields will be returned (less any fields specified as `omitFields`).
   */
  fields?: string;
  /**
   * A comma-separated list that refers to the name(s) of fields to be omitted from the results. This could be useful as a shortcut when a specific field such as large geometry fields should be omitted, but it is not practical or not desirable to explicitly whitelist fields individually. An empty value indicates that no fields will be omitted (although they may still not be present in the result if an explicit choice of fields was provided via `fields`).
   */
  omitFields?: string;
  /**
   * A comma-separated list of fields of the primary data according to which the results should be sorted. Sort order is ascending unless the field name is prefixed with a minus (for descending order).
   */
  sort?: string;
  /**
   * Page size for pagination. If not supplied, pagination with default page size of 25 elements will be applied.
   */
  'page[size]'?: number;
  /**
   * Page number for pagination. If not supplied, the first page of results will be returned.
   */
  'page[number]'?: number;
  /**
   * If set to `true`, pagination will be disabled. This overrides any other pagination query parameters, if supplied.
   */
  disablePagination?: boolean;
};

export interface FeatureCollectionClass {
  features: string[];
  type: string;
}

export interface GeoFeatureCollectionResponse {
  geojson: FeatureCollectionClass;
}

export type FeatureClassProperties = { [key: string]: any };

export type FeatureClassGeometry = { [key: string]: any };

export interface FeatureClass {
  geometry: FeatureClassGeometry;
  properties: FeatureClassProperties;
  type: string;
}

export interface GeoFeatureResponse {
  geojson: FeatureClass;
}

export type DateValueValue = { [key: string]: any };

export interface DateValue {
  value: DateValueValue;
}

export interface EUDRAlertDates {
  alertDate: DateValue;
}

export interface SerializedUrlResponseDto {
  data: UrlResponseDto;
}

export type UrlResponseAttributesParams = { [key: string]: any };

export interface UrlResponseAttributes {
  params: UrlResponseAttributesParams;
}

export interface UrlResponseDto {
  attributes: UrlResponseAttributes;
  id: string;
  type: string;
}

export interface UpdateUnitDto {
  description?: string;
  name?: string;
  symbol?: string;
}

export interface CreateUnitDto {
  description?: string;
  name: string;
  symbol?: string;
}

export interface Unit {
  description?: number;
  id: string;
  name: string;
  symbol: string;
}

export interface UpdateTargetDto {
  targetYear: number;
  value: number;
}

export interface CreateTargetDto {
  baseLineYear: number;
  indicatorId: string;
  targetYear: number;
  value: number;
}

export interface Target {
  baseLineYear: number;
  createdAt: string;
  id: string;
  indicatorId: string;
  targetYear: number;
  updatedAt: string;
  updatedById: string;
  value: number;
}

export interface UpdateIndicatorCoefficientDto {
  value?: number;
  year?: number;
}

export interface CreateIndicatorCoefficientDto {
  value?: number;
  year: number;
}

export interface IndicatorCoefficient {
  adminRegion?: AdminRegion;
  createdAt: string;
  id: string;
  indicator: Indicator;
  material: Material;
  updatedAt: string;
  user: User;
  value?: number;
  year: number;
}

export type UpdateTaskDtoNewData = { [key: string]: any };

export interface UpdateTaskDto {
  dismissedBy?: string;
  newData?: UpdateTaskDtoNewData;
  status?: string;
}

export type CreateTaskDtoData = { [key: string]: any };

export interface CreateTaskDto {
  data: CreateTaskDtoData;
  status: string;
  type: string;
}

export type TaskData = { [key: string]: any };

export interface Task {
  createdAt: string;
  data: TaskData;
  dismissedBy: string;
  errors: string[];
  id: string;
  logs: string[];
  message?: string;
  status: string;
  type: string;
  updatedAt: string;
  user: User;
}

export type UpdateSourcingLocationGroupDtoMetadata = { [key: string]: any };

export interface UpdateSourcingLocationGroupDto {
  description?: string;
  metadata?: UpdateSourcingLocationGroupDtoMetadata;
  title?: string;
}

export type CreateSourcingLocationGroupDtoMetadata = { [key: string]: any };

export interface CreateSourcingLocationGroupDto {
  description?: string;
  metadata?: CreateSourcingLocationGroupDtoMetadata;
  title: string;
}

export type SourcingLocationGroupMetadata = { [key: string]: any };

export interface SourcingLocationGroup {
  createdAt: string;
  description?: string;
  id: string;
  metadata?: SourcingLocationGroupMetadata;
  title: string;
  updatedAt: string;
  updatedById?: string;
}

export type GetContextualLayerH3ResponseDtoDataItem = {
  h?: string;
  v?: number;
};

export interface GetContextualLayerH3ResponseDto {
  data: GetContextualLayerH3ResponseDtoDataItem[];
}

export interface ContextualLayerByCategory {
  [key: string]: any;
}

export interface UpdateGeoRegionDto {
  h3Compact?: string[];
  name?: string;
  theGeom?: string;
}

export interface CreateGeoRegionDto {
  h3Compact?: string[];
  name?: string;
  theGeom?: string;
}

export interface UpdateUnitConversionDto {
  factor?: number;
  unit1?: number;
  unit2?: number;
}

export interface CreateUnitConversionDto {
  factor?: number;
  unit1?: number;
  unit2?: number;
}

export interface UnitConversion {
  factor?: number;
  id: string;
  unit1?: number;
  unit2?: number;
}

export type H3MapResponseMetadataMaterialsH3DataYearsItem = {
  materialDataType?: string;
  materialDataYear?: number;
  materialName?: string;
};

export type H3MapResponseMetadata = {
  indicatorDataYear?: number;
  materialsH3DataYears?: H3MapResponseMetadataMaterialsH3DataYearsItem[];
  quantiles?: number[];
  unit?: string;
};

export type H3MapResponseDataItem = {
  h?: string;
  v?: number;
};

export interface H3MapResponse {
  data: H3MapResponseDataItem[];
  metadata: H3MapResponseMetadata;
}

export type H3DataResponseDataItem = {
  h?: string;
  v?: number;
};

export interface H3DataResponse {
  data: H3DataResponseDataItem[];
}

export interface UpdateIndicatorRecordDto {
  status?: string;
  value?: number;
  year?: number;
}

export interface CreateIndicatorRecordDto {
  indicatorCoefficientId?: string;
  indicatorId: string;
  sourcingRecordId?: string;
  status?: string;
  statusMsg?: string;
  value: number;
}

export interface IndicatorRecord {
  createdAt: string;
  id: string;
  status: string;
  statusMsg: string;
  updatedAt: string;
  value: number;
}

export interface UpdateSourcingRecordDto {
  sourcingLocationsId?: string;
  tonnage?: number;
  year?: number;
}

export interface CreateSourcingRecordDto {
  sourcingLocationsId?: string;
  tonnage: number;
  year: number;
}

export type SourcingRecordMetadata = { [key: string]: any };

export interface SourcingRecord {
  createdAt: string;
  id: string;
  metadata?: SourcingRecordMetadata;
  tonnage: number;
  updatedAt: string;
  updatedBy: string;
  year: number;
}

export interface UpdateIndicatorDto {
  description?: string;
  metadata?: string;
  name?: string;
  nameCode?: string;
  status?: string;
}

export interface CreateIndicatorDto {
  description?: string;
  metadata?: string;
  name: string;
  nameCode: string;
  status?: string;
}

export type IndicatorMetadata = { [key: string]: any };

export interface Indicator {
  description?: string;
  id: string;
  indicatorCoefficients?: string[];
  metadata?: IndicatorMetadata;
  name: string;
  status: string;
}

export interface ScenarioVsScenarioImpactTablePurchasedTonnes {
  isProjected: boolean;
  value: number;
  year: number;
}

export interface ScenarioVsScenarioImpactTable {
  impactTable: ScenarioVsScenarioImpactTableDataByIndicator[];
  purchasedTonnes: ScenarioVsScenarioImpactTablePurchasedTonnes[];
}

export type ScenarioVsScenarioImpactTableDataByIndicatorMetadata = { [key: string]: any };

export interface ScenarioVsScenarioIndicatorSumByYearData {
  absoluteDifference: number;
  baseScenarioValue: number;
  comparedScenarioValue: number;
  isProjected: boolean;
  percentageDifference: number;
  year: number;
}

export interface ScenarioVsScenarioImpactTableDataByIndicator {
  groupBy: string;
  indicatorId: string;
  indicatorShortName: string;
  metadata: ScenarioVsScenarioImpactTableDataByIndicatorMetadata;
  rows: ScenarioVsScenarioImpactTableRows[];
  yearSum: ScenarioVsScenarioIndicatorSumByYearData[];
}

export type ScenarioVsScenarioImpactTableRowsChildrenItem = { [key: string]: any };

export interface ScenarioVsScenarioImpactTableRowsValues {
  absoluteDifference: number;
  baseScenarioValue: number;
  comparedScenarioValue: number;
  isProjected: boolean;
  percentageDifference: number;
  year: number;
}

export interface ScenarioVsScenarioImpactTableRows {
  children: ScenarioVsScenarioImpactTableRowsChildrenItem[];
  name: string;
  values: ScenarioVsScenarioImpactTableRowsValues[];
}

export interface PaginationMeta {
  [key: string]: any;
}

export interface ScenarioVsScenarioPaginatedImpactTable {
  data: ScenarioVsScenarioImpactTable;
  metadata: PaginationMeta;
}

export interface ImpactTablePurchasedTonnes {
  isProjected: boolean;
  value: number;
  year: number;
}

export interface ImpactTable {
  impactTable: ImpactTableDataByIndicator[];
  purchasedTonnes: ImpactTablePurchasedTonnes[];
}

export interface PaginatedImpactTable {
  data: ImpactTable;
  metadata: PaginationMeta;
}

export type ImpactTableDataByIndicatorMetadata = { [key: string]: any };

export interface ImpactTableDataAggregationInfo {
  [key: string]: any;
}

export interface YearSumData {
  value: number;
}

export interface ImpactTableRows {
  children: ImpactTableRowsChildrenItem[];
  name: string;
  values: ImpactTableRowsValues[];
}

export interface ImpactTableDataByIndicator {
  groupBy: string;
  indicatorId: string;
  indicatorShortName: string;
  metadata: ImpactTableDataByIndicatorMetadata;
  /** Extra information used for Ranked ImpactTable requests. Missing on normal ImpactTable requests */
  others?: ImpactTableDataAggregationInfo;
  rows: ImpactTableRows[];
  yearSum: YearSumData[];
}

export type ImpactTableRowsChildrenItem = { [key: string]: any };

export interface ImpactTableRowsValues {
  isProjected: boolean;
  value: number;
  year: number;
}

/**
 * Type of the Intervention
 */
export type UpdateScenarioInterventionDtoType =
  (typeof UpdateScenarioInterventionDtoType)[keyof typeof UpdateScenarioInterventionDtoType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UpdateScenarioInterventionDtoType = {
  default: 'default',
  Source_from_new_supplier_or_location: 'Source from new supplier or location',
  Change_production_efficiency: 'Change production efficiency',
  Switch_to_a_new_material: 'Switch to a new material',
} as const;

/**
 * Status of the intervention
 */
export type UpdateScenarioInterventionDtoStatus =
  (typeof UpdateScenarioInterventionDtoStatus)[keyof typeof UpdateScenarioInterventionDtoStatus];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UpdateScenarioInterventionDtoStatus = {
  active: 'active',
  inactive: 'inactive',
  deleted: 'deleted',
} as const;

/**
 * Type of new Supplier Location, is required for Intervention types: Switch to a new material and Source from new supplier or location
 */
export type UpdateScenarioInterventionDtoNewLocationType =
  (typeof UpdateScenarioInterventionDtoNewLocationType)[keyof typeof UpdateScenarioInterventionDtoNewLocationType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UpdateScenarioInterventionDtoNewLocationType = {
  unknown: 'unknown',
  'production-aggregation-point': 'production-aggregation-point',
  'point-of-production': 'point-of-production',
  'country-of-production': 'country-of-production',
  'administrative-region-of-production': 'administrative-region-of-production',
  'country-of-delivery': 'country-of-delivery',
  eudr: 'eudr',
} as const;

export interface UpdateScenarioInterventionDto {
  /** Ids of Admin Regions that will be affected by intervention */
  adminRegionIds?: string[];
  /** Ids of Business Units that will be affected by intervention */
  businessUnitIds?: string[];
  /** Brief description of the Intervention */
  description?: string;
  /** End year of the Intervention */
  endYear?: number;
  /** Ids of Materials that will be affected by intervention */
  materialIds?: string[];
  newIndicatorCoefficients?: IndicatorCoefficientsDto;
  /** 
    New Supplier Location address, is required for Intervention types: Switch to a new material, Source from new supplier or location
    and New Supplier Locations of types: point-of-production and production-aggregation-point in case no coordintaes were provided.
    Address OR coordinates must be provided.

    Must be NULL for New Supplier Locations of types: unknown and country-of-production
    or if coordinates are provided for the relevant location types */
  newLocationAddressInput?: string;
  /** New Administrative Region, is required for Intervention types: Switch to a new material, Source from new supplier or location
    for Location Type: administrative-region-of-production */
  newLocationAdminRegionInput?: string;
  /** New Supplier Location country, is required for Intervention types: Switch to a new material, Source from new supplier or location */
  newLocationCountryInput?: string;
  /**
   * 
    New Supplier Location latitude, is required for Intervention types: Switch to a new material, Source from new supplier or location
    and New Supplier Locations of types: point-of-production and production-aggregation-point in case no address was provided.
    Address OR coordinates must be provided.

    Must be NULL for New Supplier Locations of types: unknown and country-of-production
    or if address is provided for the relevant location types.
   * @minimum -90
   * @maximum 90
   */
  newLocationLatitude?: number;
  /**
   * 
    New Supplier Location longitude, is required for Intervention types: Switch to a new material, Source from new supplier or location
    and New Supplier Locations of types: point-of-production and production-aggregation-point in case no address was provided.
    Address OR coordinates must be provided.

    Must be NULL for New Supplier Locations of type: unknown and country-of-production
    or if address is provided for the relevant location types.
   * @minimum -180
   * @maximum 180
   */
  newLocationLongitude?: number;
  /** Type of new Supplier Location, is required for Intervention types: Switch to a new material and Source from new supplier or location */
  newLocationType?: UpdateScenarioInterventionDtoNewLocationType;
  /** Id of the New Material, is required if Intervention type is Switch to a new material */
  newMaterialId?: string;
  /** New Material tonnage ratio */
  newMaterialTonnageRatio?: number;
  /** Id of the New Producer */
  newProducerId?: string;
  /** Id of the New Supplier */
  newT1SupplierId?: string;
  /** Percentage of the chosen sourcing records affected by intervention */
  percentage?: number;
  /** Ids of Producers that will be affected by intervention */
  producerIds?: string[];
  /** Id of Scenario the intervention belongs to */
  scenarioId?: unknown;
  /** Start year of the Intervention */
  startYear?: number;
  /** Status of the intervention */
  status?: UpdateScenarioInterventionDtoStatus;
  /** Ids of T1 Suppliers that will be affected by intervention */
  t1SupplierIds?: string[];
  /** Title of the Intervention */
  title?: string;
  /** Type of the Intervention */
  type?: UpdateScenarioInterventionDtoType;
}

/**
 * Type of the Intervention
 */
export type CreateScenarioInterventionDtoType =
  (typeof CreateScenarioInterventionDtoType)[keyof typeof CreateScenarioInterventionDtoType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreateScenarioInterventionDtoType = {
  default: 'default',
  Source_from_new_supplier_or_location: 'Source from new supplier or location',
  Change_production_efficiency: 'Change production efficiency',
  Switch_to_a_new_material: 'Switch to a new material',
} as const;

/**
 * Type of new Supplier Location, is required for Intervention types: Switch to a new material and Source from new supplier or location
 */
export type CreateScenarioInterventionDtoNewLocationType =
  (typeof CreateScenarioInterventionDtoNewLocationType)[keyof typeof CreateScenarioInterventionDtoNewLocationType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreateScenarioInterventionDtoNewLocationType = {
  unknown: 'unknown',
  'production-aggregation-point': 'production-aggregation-point',
  'point-of-production': 'point-of-production',
  'country-of-production': 'country-of-production',
  'administrative-region-of-production': 'administrative-region-of-production',
  'country-of-delivery': 'country-of-delivery',
  eudr: 'eudr',
} as const;

export interface IndicatorCoefficientsDto {
  DF_SLUC?: number;
  ENL?: number;
  FLIL?: number;
  GHG_DEF_SLUC?: number;
  GHG_FARM?: number;
  LF?: number;
  NCE?: number;
  NL?: number;
  UWU?: number;
  WU?: number;
}

export interface CreateScenarioInterventionDto {
  /** Ids of Admin Regions that will be affected by intervention */
  adminRegionIds: string[];
  /** Ids of Business Units that will be affected by intervention */
  businessUnitIds?: string[];
  /** Brief description of the Intervention */
  description?: string;
  /** End year of the Intervention */
  endYear?: number;
  /** Ids of Materials that will be affected by intervention */
  materialIds: string[];
  newIndicatorCoefficients?: IndicatorCoefficientsDto;
  /** 
    New Supplier Location address, is required for Intervention types: Switch to a new material, Source from new supplier or location
    and New Supplier Locations of types: point-of-production and production-aggregation-point in case no coordintaes were provided.
    Address OR coordinates must be provided.

    Must be NULL for New Supplier Locations of types: unknown and country-of-production
    or if coordinates are provided for the relevant location types */
  newLocationAddressInput?: string;
  /** New Administrative Region, is required for Intervention types: Switch to a new material, Source from new supplier or location
    for Location Type: administrative-region-of-production */
  newLocationAdminRegionInput: string;
  /** New Supplier Location country, is required for Intervention types: Switch to a new material, Source from new supplier or location */
  newLocationCountryInput: string;
  /**
   * 
    New Supplier Location latitude, is required for Intervention types: Switch to a new material, Source from new supplier or location
    and New Supplier Locations of types: point-of-production and production-aggregation-point in case no address was provided.
    Address OR coordinates must be provided.

    Must be NULL for New Supplier Locations of types: unknown and country-of-production
    or if address is provided for the relevant location types.
   * @minimum -90
   * @maximum 90
   */
  newLocationLatitude?: number;
  /**
   * 
    New Supplier Location longitude, is required for Intervention types: Switch to a new material, Source from new supplier or location
    and New Supplier Locations of types: point-of-production and production-aggregation-point in case no address was provided.
    Address OR coordinates must be provided.

    Must be NULL for New Supplier Locations of type: unknown and country-of-production
    or if address is provided for the relevant location types.
   * @minimum -180
   * @maximum 180
   */
  newLocationLongitude?: number;
  /** Type of new Supplier Location, is required for Intervention types: Switch to a new material and Source from new supplier or location */
  newLocationType?: CreateScenarioInterventionDtoNewLocationType;
  /** Id of the New Material, is required if Intervention type is Switch to a new material */
  newMaterialId?: string;
  /** New Material tonnage ratio */
  newMaterialTonnageRatio?: number;
  /** Id of the New Producer */
  newProducerId?: string;
  /** Id of the New Supplier */
  newT1SupplierId?: string;
  /** Percentage of the chosen sourcing records affected by intervention */
  percentage: number;
  /** Ids of Producers that will be affected by intervention */
  producerIds?: string[];
  /** Id of Scenario the intervention belongs to */
  scenarioId: unknown;
  /** Start year of the Intervention */
  startYear: number;
  /** Ids of T1 Suppliers that will be affected by intervention */
  t1SupplierIds?: string[];
  /** Title of the Intervention */
  title: string;
  /** Type of the Intervention */
  type: CreateScenarioInterventionDtoType;
}

export type ScenarioInterventionNewIndicatorCoefficients = { [key: string]: any };

export interface ScenarioIntervention {
  createdAt: string;
  description?: string;
  endYear?: number;
  id: string;
  newAdminRegion?: AdminRegion;
  newBusinessUnit?: BusinessUnit;
  newIndicatorCoefficients: ScenarioInterventionNewIndicatorCoefficients;
  newLocationAddressInput?: string;
  newLocationCountryInput?: string;
  newLocationLatitudeInput?: number;
  newLocationLongitudeInput?: number;
  newLocationType?: string;
  newMaterial?: Material;
  newMaterialTonnageRatio?: number;
  newProducer?: Supplier;
  newT1Supplier?: Supplier;
  percentage: number;
  scenario: Scenario;
  startYear: number;
  status: string;
  title: string;
  type: string;
  updatedAt: string;
  updatedBy: User;
  updatedById?: string;
}

export interface UpdateScenarioDto {
  description?: string;
  isPublic?: boolean;
  metadata?: string;
  status?: string;
  title?: string;
}

export interface CreateScenarioDto {
  description?: string;
  isPublic?: boolean;
  metadata?: string;
  status?: string;
  title: string;
}

export type ScenarioStatus = (typeof ScenarioStatus)[keyof typeof ScenarioStatus];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ScenarioStatus = {
  active: 'active',
  inactive: 'inactive',
  deleted: 'deleted',
} as const;

export type ScenarioMetadata = { [key: string]: any };

export interface Scenario {
  createdAt: string;
  description?: string;
  id: string;
  /** Make a Scenario public to all users */
  isPublic?: boolean;
  metadata?: ScenarioMetadata;
  status: ScenarioStatus;
  title: string;
  updatedAt: string;
  updatedBy: User;
  updatedById?: string;
  user: User;
  userId?: string;
}

export type UpdateUserDTOTitle = { [key: string]: any };

export type UpdateUserDTORolesItem =
  (typeof UpdateUserDTORolesItem)[keyof typeof UpdateUserDTORolesItem];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UpdateUserDTORolesItem = {
  admin: 'admin',
  user: 'user',
} as const;

export type UpdateUserDTOLname = { [key: string]: any };

export type UpdateUserDTOFname = { [key: string]: any };

export interface UpdateUserDTO {
  avatarDataUrl?: string;
  email?: string;
  fname?: UpdateUserDTOFname;
  lname?: UpdateUserDTOLname;
  password?: string;
  roles?: UpdateUserDTORolesItem[];
  title?: UpdateUserDTOTitle;
}

export interface RecoverPasswordDto {
  [key: string]: any;
}

export type UpdateOwnUserDTOTitle = { [key: string]: any };

export type UpdateOwnUserDTOLname = { [key: string]: any };

export type UpdateOwnUserDTOFname = { [key: string]: any };

export interface UpdateOwnUserDTO {
  avatarDataUrl?: string;
  email: string;
  fname?: UpdateOwnUserDTOFname;
  lname?: UpdateOwnUserDTOLname;
  title?: UpdateOwnUserDTOTitle;
}

export interface UserResult {
  data: JSONAPIUserData;
}

export interface UpdateUserPasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export type CreateUserDTOTitle = { [key: string]: any };

export type CreateUserDTORolesItem =
  (typeof CreateUserDTORolesItem)[keyof typeof CreateUserDTORolesItem];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreateUserDTORolesItem = {
  admin: 'admin',
  user: 'user',
} as const;

export type CreateUserDTOLname = { [key: string]: any };

export type CreateUserDTOFname = { [key: string]: any };

export interface CreateUserDTO {
  avatarDataUrl?: string;
  email: string;
  fname?: CreateUserDTOFname;
  lname?: CreateUserDTOLname;
  password: string;
  roles: CreateUserDTORolesItem[];
  title?: CreateUserDTOTitle;
}

export type CreateApiEventDTOData = { [key: string]: any };

export interface CreateApiEventDTO {
  data?: CreateApiEventDTOData;
  kind: string;
  topic: string;
}

export interface ApiEvent {
  kind: string;
  topic: string;
}

export interface JSONAPIApiEventData {
  attributes: ApiEvent;
  id: string;
  type: string;
}

export interface ApiEventResult {
  data: JSONAPIApiEventData;
}

export interface JSONAPIUserData {
  attributes: User;
  id: string;
  type: string;
}

export type RoleName = (typeof RoleName)[keyof typeof RoleName];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const RoleName = {
  admin: 'admin',
  user: 'user',
} as const;

export interface Permission {
  action: string;
}

export interface Role {
  name: RoleName;
  permissions: Permission[];
}

export interface User {
  avatarDataUrl?: string;
  email: string;
  fname?: string;
  isActive: boolean;
  isDeleted: boolean;
  lname?: string;
  roles: Role[];
  title?: string;
}

export interface ResetPasswordDto {
  password: string;
}

export type AccessTokenUser = { [key: string]: any };

export interface AccessToken {
  accessToken: string;
  user: AccessTokenUser;
}

export interface LoginDto {
  password: string;
  username: string;
}

export type UpdateSourcingLocationDtoMetadata = { [key: string]: any };

export interface UpdateSourcingLocationDto {
  businessUnitId?: string;
  locationAccuracy?: string;
  locationAddressInput?: string;
  locationCountryInput?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  locationType?: string;
  materialId?: string;
  metadata?: UpdateSourcingLocationDtoMetadata;
  producerId?: string;
  sourcingLocationGroupId?: string;
  t1SupplierId?: string;
  title?: string;
}

export type CreateSourcingLocationDtoMetadata = { [key: string]: any };

export interface CreateSourcingLocationDto {
  businessUnitId?: string;
  locationAccuracy?: string;
  locationAddressInput?: string;
  locationCountryInput?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  locationType?: string;
  materialId: string;
  metadata?: CreateSourcingLocationDtoMetadata;
  producerId?: string;
  sourcingLocationGroupId?: string;
  t1SupplierId?: string;
  title: string;
}

export type LocationTypesDtoDataItem = {
  label?: string;
  value?: string;
};

export interface LocationTypesDto {
  data: LocationTypesDtoDataItem[];
}

export type SourcingLocationsMaterialsResponseDtoMeta = {
  page?: number;
  size?: number;
  totalItems?: number;
  totalPages?: number;
};

export interface SourcingLocationsMaterialsResponseDto {
  data: SourcingLocationsMaterialsResponseDtoDataItem[];
  meta: SourcingLocationsMaterialsResponseDtoMeta;
}

export type SourcingLocationsMaterialsResponseDtoDataItemAttributesPurchasesItem = {
  tonnage?: number;
  year?: number;
};

export type SourcingLocationsMaterialsResponseDtoDataItemAttributes = {
  businessUnit?: string;
  locationCountryInput?: string;
  locationType?: string;
  material?: string;
  materialId?: string;
  producer?: string;
  purchases?: SourcingLocationsMaterialsResponseDtoDataItemAttributesPurchasesItem[];
  t1Supplier?: string;
};

export type SourcingLocationsMaterialsResponseDtoDataItem = {
  attributes?: SourcingLocationsMaterialsResponseDtoDataItemAttributes;
  id?: string;
  type?: string;
};

export type SourcingLocationMetadata = { [key: string]: any };

export interface SourcingLocation {
  adminRegionId?: string;
  businessUnitId?: string;
  createdAt: string;
  geoRegionId?: string;
  id: string;
  interventionType?: string;
  locationAccuracy: string;
  locationAddressInput?: string;
  locationCountryInput?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  locationType: string;
  locationWarning?: string;
  materialId?: string;
  metadata?: SourcingLocationMetadata;
  scenarioInterventionId?: string;
  sourcingLocationGroupId?: string;
  title?: string;
  updatedAt: string;
}

export interface UpdateBusinessUnitDto {
  description?: string;
  metadata?: string;
  name?: string;
  status?: string;
}

export interface CreateBusinessUnitDto {
  description?: string;
  metadata?: string;
  name: string;
  status?: string;
}

export type BusinessUnitMetadata = { [key: string]: any };

export interface BusinessUnit {
  description?: string;
  id: string;
  metadata?: BusinessUnitMetadata;
  name: string;
  status: string;
}

export interface UpdateSupplierDto {
  description?: string;
  metadata?: string;
  name?: string;
  parentId?: string;
  status?: string;
}

export interface CreateSupplierDto {
  description?: string;
  metadata?: string;
  name: string;
  parentId?: string;
  status?: string;
}

export type SupplierMetadata = { [key: string]: any };

export interface Supplier {
  address?: string;
  companyId?: string;
  createdAt: string;
  description?: string;
  id: string;
  metadata?: SupplierMetadata;
  name: string;
  parentId?: string;
  status: string;
  updatedAt: string;
}

export interface UpdateMaterialDto {
  description?: string;
  earthstatId?: string;
  hsCodeId?: string;
  mapspamId?: string;
  metadata?: string;
  name?: string;
  parentId?: string;
  status?: string;
}

export interface CreateMaterialDto {
  description?: string;
  earthstatId?: string;
  hsCodeId: string;
  mapspamId?: string;
  metadata?: string;
  name: string;
  parentId?: string;
  status?: string;
}

export type MaterialMetadata = { [key: string]: any };

export interface Material {
  createdAt: string;
  description?: string;
  earthstatId?: string;
  hsCodeId?: string;
  id: string;
  mapspamId?: string;
  metadata?: MaterialMetadata;
  name: string;
  parentId?: string;
  status: string;
  updatedAt: string;
}

export interface UpdateAdminRegionDto {
  description?: string;
  isoA2?: string;
  isoA3?: string;
  metadata?: string;
  name?: string;
  status?: string;
}

export interface CreateAdminRegionDto {
  description?: string;
  isoA2?: string;
  isoA3?: string;
  metadata?: string;
  name: string;
  status?: string;
}

export type GeoRegionTheGeom = { [key: string]: any };

export interface GeoRegion {
  adminRegions?: string[];
  id: string;
  name?: string;
  sourcingLocations?: string[];
  theGeom?: GeoRegionTheGeom;
}

export interface AdminRegion {
  description?: string;
  geoRegion: GeoRegion;
  geoRegionId?: string;
  id: string;
  isoA2?: string;
  isoA3?: string;
  name?: string;
  parent?: AdminRegion;
  parentId?: string;
  sourcingLocations?: string[];
  status: string;
}
