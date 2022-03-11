import { INDICATOR_TYPES } from 'modules/indicators/indicator.entity';

export interface IndicatorCoefficientsInterface {
  [INDICATOR_TYPES.DEFORESTATION]: number;
  [INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE]: number;
  [INDICATOR_TYPES.BIODIVERSITY_LOSS]: number;
  [INDICATOR_TYPES.CARBON_EMISSIONS]: number;
}
