export enum InterventionTypes {
  Material = 'Switch to a new material',
  SupplierLocation = 'Source from new supplier or location',
  Efficiency = 'Change production efficiency',
}

export enum LocationTypes {
  unknown = 'unknown',
  aggregationPoint = 'aggregation-point',
  pointOfProduction = 'point-of-production',
  countryOfProduction = 'country-of-production',
}

export enum LocationStatus {
  active = 'active',
  inactive = 'inactive',
}
