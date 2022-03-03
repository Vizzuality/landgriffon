/**
 * @description: Interface for typing the properties to calculate the values per indicator of a indicator record
 * on the fly
 * @note: This could be probably done within the DB in the future
 */
import { INDICATOR_TYPES } from 'modules/indicators/indicator.entity';

export class IndicatorRecordCalculatedValuesDto {
  sourcingRecordId: string;
  production: number;

  landPerTon: number;
  landUse: number;
  deforestationPerHarvestedAreaLandUse: number;
  biodiversityLossPerHarvestedAreaLandUse: number;
  carbonLossPerHarvestedAreaLandUse: number;

  // Indicator name codes:
  [INDICATOR_TYPES.DEFORESTATION]: string;
  [INDICATOR_TYPES.BIODIVERSITY_LOSS]: string;
  [INDICATOR_TYPES.CARBON_EMISSIONS]: string;
  [INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE]: string;
}
