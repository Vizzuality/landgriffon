import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { ImpactQueryExpression } from 'modules/indicator-records/services/impact-calculation.dependencies';
import {
  CalculationContext,
  IIndicatorCalculationStrategy,
} from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';

/**
 * WWIndicatorStrategy implements the calculation for the WW indicator.
 *
 * It defines:
 *   - Query dependency: to fetch the raw WW value using a stored procedure.
 *   - Arithmetic calculation: calculates the final WW value by multiplying the raw WW value by the tonnage.
 */
export class WaterWithdrawalsStrategy implements IIndicatorCalculationStrategy {
  // Unique indicator code for WW
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.WW;

  /**
   * Returns the query fragment needed to obtain the raw value for WW.
   */
  getRawQueries(): ImpactQueryExpression[] {
    return [
      // Query to obtain the raw WW value via the stored procedure,
      // using the internal indicatorCode for aliasing.
      `get_indicator_coefficient_impact('${this.indicatorCode}', $3, $2) as "${this.indicatorCode}"`,
    ];
  }

  /**
   * Calculates the final WW indicator value using the provided calculation context.
   * The calculation is based on:
   *   - Final WW = raw WW value * tonnage
   *
   * @param context - Calculation context containing rawData and tonnage.
   * @returns The calculated WW value.
   */
  calculate(context: CalculationContext): number {
    const { rawData, tonnage } = context;
    const rawWW = rawData[this.indicatorCode];
    return rawWW * tonnage || 0;
  }
}
