import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { ImpactQueryExpression } from 'modules/indicator-records/services/impact-calculation.dependencies';
import {
  CalculationContext,
  IIndicatorCalculationStrategy,
} from 'modules/indicator-records/strategies/indicator-calculation.strategy.interface';

/**
 * WCIndicatorStrategy implements the calculation for the WC indicator.
 *
 * It defines:
 *   - Query dependency: to fetch the raw WC value using a stored procedure.
 *   - Arithmetic calculation: calculates the final WC value by multiplying the raw WC value by the tonnage.
 */
export class WaterConsumptionStrategy implements IIndicatorCalculationStrategy {
  // Unique indicator code for WC
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.WC;

  /**
   * Returns the query fragment needed to obtain the raw value for WC.
   */
  getRawQueries(): ImpactQueryExpression[] {
    return [
      // Query to obtain the raw WC value via the stored procedure,
      // using the internal indicatorCode for aliasing.
      `get_indicator_coefficient_impact('${this.indicatorCode}', $3, $2) as "${this.indicatorCode}"`,
    ];
  }

  /**
   * Calculates the final WC indicator value using the provided calculation context.
   * The calculation is based on:
   *   - Final WC = raw WC value * tonnage
   *
   * @param context - Calculation context containing rawData and tonnage.
   * @returns The calculated WC value.
   */
  calculate(context: CalculationContext): number {
    const { rawData, tonnage } = context;
    const rawWC = rawData[this.indicatorCode];
    return rawWC * tonnage || 0;
  }
}
