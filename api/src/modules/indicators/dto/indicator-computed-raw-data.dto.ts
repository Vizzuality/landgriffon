/**
 * @description Raw indicator data computed in DB using stored functions of migration: XXXXXX
 * used to calculate impact for a Intervention
 */
import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';

export class IndicatorComputedRawDataDto {
  production: number;
  harvestedArea: number;
  indicatorValues: Map<INDICATOR_NAME_CODES, number>;
}
