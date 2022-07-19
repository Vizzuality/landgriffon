export enum InterventionTypes {
  SupplierLocation = 'Source from new supplier or location',
  Material = 'Switch to a new material',
  Efficiency = 'Change production efficiency',
}

export enum LocationTypes {
  aggregationPoint = 'aggregation-point',
  pointOfProduction = 'point-of-production',
  countryOfProduction = 'country-of-production',
}

export enum LocationStatus {
  active = 'active',
  inactive = 'inactive',
}
