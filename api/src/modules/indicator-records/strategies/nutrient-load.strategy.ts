import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { ImpactQueryExpression } from 'modules/indicator-records/services/impact-calculation.dependencies';
import {
  CalculationContext,
  IIndicatorCalculationStrategy,
} from 'modules/indicator-records/strategies/indicator-calculation.strategy.interface';

/**
 * NLIndicatorStrategy implements the calculation for the NL indicator.
 *
 * It defines:
 *   - Query dependency: to fetch the raw NL value using a stored procedure.
 *   - Arithmetic calculation: calculates the final NL value by simply multiplying the raw NL value by the tonnage.
 */
export class NutrientLoadStrategy implements IIndicatorCalculationStrategy {
  // Unique indicator code for NL
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.NL;

  /**
   * Returns the query fragment needed to obtain the raw value for NL.
   */
  getRawQueries(): ImpactQueryExpression[] {
    return [
      // Query to obtain the raw NL value via the stored procedure,
      // using the internal indicatorCode for aliasing.
      `get_indicator_coefficient_impact('${this.indicatorCode}', $3, $2) as "${this.indicatorCode}"`,
    ];
  }

  /**
   * Calculates the final NL indicator value using the provided calculation context.
   * The calculation is based on:
   *   - Final NL = raw NL value * tonnage
   *
   * @param context - Calculation context containing rawData and tonnage.
   * @returns The calculated NL value.
   */
  calculate(context: CalculationContext): number {
    const { rawData, tonnage } = context;
    const rawNL = rawData[INDICATOR_NAME_CODES.NL];
    return rawNL * tonnage || 0;
  }
}
