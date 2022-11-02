export interface SourcingRecordsSheets extends Record<string, any[]> {
  materials: Record<string, any>[];
  countries: Record<string, any>[];
  businessUnits: Record<string, any>[];
  suppliers: Record<string, any>[];
  sourcingData: Record<string, any>[];
  indicators: Record<string, any>[];
}
