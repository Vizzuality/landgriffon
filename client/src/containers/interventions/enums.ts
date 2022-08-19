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

export enum InfoTooltip {
  newMaterial = 'Change to a new raw material. If your intervention combines multiple raw materials, all of them will be replaced by the newly selected one. If a different volume of the new material is required, enter the ratio of the new tonnage to the old tonnage in "Tons of new material per ton".',
  newSupplier = 'Change to a new supplier or producer to your organization. If your intervention combines multiple suppliers, all of them will be replaced by the new selected one.',
  supplierLocation = 'Change to the new location where your supplier is offering the services. If your intervention combines multiple locations, all of them will be replaced by the new selected one.',
  supplierImpactsPerTon = 'Select between the LandGriffon location-based estimates or input your own values to compute the impacts for the selected materials. The Landgriffon location-based estimates are computed using the Landgriffon methodology. To know more about this, please go to the Help section.',
}
