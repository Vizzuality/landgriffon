import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { ImpactQueryExpression } from 'modules/indicator-records/services/impact-calculation.dependencies';
import {
  CalculationContext,
  IIndicatorCalculationStrategy,
} from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';

/**
 * UWUIndicatorStrategy implements the calculation for the UWU indicator.
 *
 * It defines:
 *   - Query dependencies: to fetch the raw UWU value via its stored procedure,
 *     the production value, and the WU value (needed for calculating waterUseValue).
 *   - Arithmetic calculation:
 *       1. waterUseValue = raw WU value * tonnage.
 *       2. Final UWU = (raw UWU value * waterUseValue) / (100 * production),
 *          with safeguards against division by zero.
 */
export class UnsustainableWaterUseStrategy
  implements IIndicatorCalculationStrategy
{
  // Unique indicator code for UWU
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.UWU;

  // To calculate the UWU value, we need the WU value.
  dependencies: {
    WW: INDICATOR_NAME_CODES.WU;
  };

  /**
   * Returns the query fragments needed to obtain the raw values for UWU.
   */
  getRawQueries(): ImpactQueryExpression[] {
    return [
      // Query to obtain the raw UWU value via the stored procedure,
      // using the internal indicatorCode for aliasing.
      `get_annual_commodity_weighted_impact_over_georegion($1, '${this.indicatorCode}', $2, 'producer') as "${this.indicatorCode}"`,
      // Query to obtain the production value.
      `sum_material_over_georegion($1, $2, 'producer') as "production"`,
      // Query to obtain the WU value (used to calculate waterUseValue).
      `get_indicator_coefficient_impact('${this.dependencies.WW}', $3, $2) as "${this.dependencies.WW}"`,
    ];
  }

  /**
   * Calculates the final UWU indicator value using the provided calculation context.
   * The calculation is based on:
   *   - waterUseValue = raw WU value * tonnage.
   *   - Final UWU = (raw UWU value * waterUseValue) / (100 * production),
   *     with safeguards against division by zero.
   *
   * @param context - Calculation context containing rawData, tonnage, production, etc.
   * @returns The calculated UWU value.
   */
  calculate(context: CalculationContext): number {
    const { rawData, tonnage, production } = context;

    // Calculate waterUseValue using the raw WU value and tonnage.
    const waterUseValue = rawData[this.dependencies.WW] * tonnage;

    // Retrieve the raw UWU value.
    const rawUWU = rawData[this.indicatorCode];

    // Calculate UWU value, ensuring no division by zero.
    const finalUWU =
      production !== 0 &&
      Number.isFinite((rawUWU * waterUseValue) / (100 * production))
        ? (rawUWU * waterUseValue) / (100 * production)
        : 0;

    return finalUWU;
  }
}
