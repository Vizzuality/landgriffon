/**
 * @description Raw indicator data computed in DB using stored functions of migration: XXXXXX
 * used to calculate impact for a Intervention
 */

export class IndicatorComputedRawDataDto {
  production: number;
  harvestedArea: number;
  rawDeforestation: number;
  rawBiodiversity: number;
  rawCarbon: number;
  rawWater: number;
}
