/**
 * @description: Interface for typing the properties to calculate the values per indicator of a indicator record
 * on the fly
 * @note: This could be probably done within the DB in the future
 */
import { INDICATOR_TYPES } from 'modules/indicators/indicator.entity';

export class IndicatorRecordCalculatedValuesDto {
  sourcingRecordId: string;
  production: number;
  materialH3DataId: string;

  landPerTon: number;
  landUse: number;
  deforestationPerHarvestedAreaLandUse: number;
  biodiversityLossPerHarvestedAreaLandUse: number;
  carbonLossPerHarvestedAreaLandUse: number;

  // Indicator name codes:
  [INDICATOR_TYPES.DEFORESTATION]: number;
  [INDICATOR_TYPES.BIODIVERSITY_LOSS]: number;
  [INDICATOR_TYPES.CARBON_EMISSIONS]: number;
  [INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE]: number;
}
