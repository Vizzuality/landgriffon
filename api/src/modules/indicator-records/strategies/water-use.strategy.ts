import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { ImpactQueryExpression } from 'modules/indicator-records/services/impact-calculation.dependencies';
import {
  CalculationContext,
  IIndicatorCalculationStrategy,
} from 'modules/indicator-records/strategies/indicator-calculation.strategy.interface';

/**
 * WUIndicatorStrategy implements the calculation for the WU indicator.
 *
 * It defines:
 *   - Query dependency: to fetch the raw WU value using a stored procedure.
 *   - Arithmetic calculation: calculates the final WU value by multiplying the raw WU value by the tonnage.
 */
export class WaterUseStrategy implements IIndicatorCalculationStrategy {
  // Unique indicator code for WU
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.WU;

  /**
   * Returns the query fragment needed to obtain the raw value for WU.
   */
  getRawQueries(): ImpactQueryExpression[] {
    return [
      // Query to obtain the raw WU value via the stored procedure,
      // using the internal indicator code for aliasing.
      `get_indicator_coefficient_impact('${this.indicatorCode}', $3, $2) as "${this.indicatorCode}"`,
    ];
  }

  /**
   * Calculates the final WU indicator value using the provided calculation context.
   * The calculation is based on:
   *   - Final WU = raw WU value * tonnage (if the product is falsy, returns 0).
   *
   * @param context - Calculation context containing rawData and tonnage.
   * @returns The calculated WU value.
   */
  calculate(context: CalculationContext): number {
    const { rawData, tonnage } = context;
    const rawWU = rawData[INDICATOR_NAME_CODES.WU];
    return rawWU * tonnage || 0;
  }
}
