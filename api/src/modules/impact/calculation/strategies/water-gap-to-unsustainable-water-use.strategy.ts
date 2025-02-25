import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { ImpactQueryExpression } from 'modules/indicator-records/services/impact-calculation.dependencies';
import {
  CalculationContext,
  IIndicatorCalculationStrategy,
} from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';

/**
 * WGUWUIndicatorStrategy implements the calculation for the WGUWU indicator.
 *
 * It defines:
 *   - Query dependencies: to fetch the raw WGUWU value via a stored procedure,
 *     the WW value (used to compute the water withdrawal),
 *     and the production value.
 *   - Arithmetic calculation:
 *       1. waterWithdrawalValue = raw WW value * tonnage.
 *       2. Final WGUWU = (raw WGUWU value * waterWithdrawalValue) / (100 * production),
 *          with safeguards against division by zero.
 */
export class WaterGapToUnsustainableWaterUseStrategy
  implements IIndicatorCalculationStrategy
{
  // Unique indicator code for WGUWU
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.WGUWU;

  dependencies: {
    [INDICATOR_NAME_CODES.WW]: INDICATOR_NAME_CODES.WW;
  } = { [INDICATOR_NAME_CODES.WW]: INDICATOR_NAME_CODES.WW };

  /**
   * Returns the query fragments needed to obtain the raw values for WGUWU.
   */
  getRawQueries(): ImpactQueryExpression[] {
    return [
      // Query to obtain the raw WGUWU value via its stored procedure,
      // using the internal indicator code for aliasing.
      `get_annual_commodity_weighted_impact_over_georegion($1, '${this.indicatorCode}', $2, 'producer') as "${this.indicatorCode}"`,
      // Query to obtain the raw WW value (used to calculate water withdrawal).
      `get_indicator_coefficient_impact('${this.dependencies.WW}', $3, $2) as "${this.dependencies.WW}"`,
      // Query to obtain the production value.
      `sum_material_over_georegion($1, $2, 'producer') as "production"`,
    ];
  }

  /**
   * Calculates the final WGUWU indicator value using the provided calculation context.
   * The calculation is based on:
   *   - waterWithdrawalValue = raw WW value * tonnage.
   *   - Final WGUWU = (raw WGUWU value * waterWithdrawalValue) / (100 * production),
   *     with safeguards against division by zero.
   *
   * @param context - Calculation context containing rawData, tonnage, production, etc.
   * @returns The calculated WGUWU value.
   */
  calculate(context: CalculationContext): number {
    const { rawData, tonnage, production } = context;

    // Calculate waterWithdrawalValue using the raw WW value and tonnage.
    const waterWithdrawalValue = rawData[this.dependencies.WW] * tonnage || 0;

    // Compute final WGUWU value; guard against division by zero.
    const finalValue =
      production !== 0 &&
      Number.isFinite(
        (rawData[this.indicatorCode] * waterWithdrawalValue) /
          (100 * production),
      )
        ? (rawData[this.indicatorCode] * waterWithdrawalValue) /
          (100 * production)
        : 0;

    return finalValue;
  }
}
