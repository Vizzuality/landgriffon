import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { ImpactQueryExpression } from 'modules/indicator-records/services/impact-calculation.dependencies';
import {
  CalculationContext,
  IIndicatorCalculationStrategy,
} from 'modules/indicator-records/strategies/indicator-calculation.strategy.interface';

/**
 * ENLIndicatorStrategy implements the calculation for the ENL indicator.
 *
 * It defines:
 *   - Query dependencies: to fetch the raw ENL value via a stored procedure,
 *     the production value, and the NL value (used to calculate nutrient load).
 *   - Arithmetic calculation:
 *       1. nutrientLoad = (raw NL value * tonnage)
 *       2. Final ENL = (raw ENL value * nutrientLoad) / (100 * production)
 *          (with safeguards against division by zero)
 */
export class ExcessNutrientLoadStrategy
  implements IIndicatorCalculationStrategy
{
  // Unique indicator code for ENL
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.ENL;

  dependencies: {
    NL: INDICATOR_NAME_CODES;
  };

  /**
   * Returns the query fragments needed to obtain the raw values for ENL.
   */
  getRawQueries(): ImpactQueryExpression[] {
    return [
      // Query to obtain the raw ENL value using the stored procedure.
      `get_annual_commodity_weighted_impact_over_georegion($1, '${this.indicatorCode}', $2, 'producer') as "${this.indicatorCode}"`,
      // Query to obtain the production value.
      `sum_material_over_georegion($1, $2, 'producer') as "production"`,
      // Query to obtain the NL value, which is used to calculate nutrient load.
      `get_indicator_coefficient_impact('${this.dependencies.NL}', $3, $2) as "${this.dependencies.NL}"`,
    ];
  }

  /**
   * Calculates the final ENL indicator value using the provided calculation context.
   * The calculation is based on:
   *   - nutrientLoad = raw NL value * tonnage.
   *   - Final ENL = (raw ENL value * nutrientLoad) / (100 * production),
   *     with safeguards against division by zero.
   *
   * @param context - Calculation context containing rawData, tonnage, production, etc.
   * @returns The calculated ENL value.
   */
  calculate(context: CalculationContext): number {
    const { rawData, tonnage, production } = context;

    // Calculate nutrient load using the NL value multiplied by tonnage.
    const nutrientLoad = rawData[this.dependencies.NL] * tonnage;

    // Retrieve the raw ENL value.
    const rawENL = rawData[this.indicatorCode];

    // Calculate final ENL, guarding against division by zero.
    const finalENL =
      production !== 0 &&
      Number.isFinite((rawENL * nutrientLoad) / (100 * production))
        ? (rawENL * nutrientLoad) / (100 * production)
        : 0;

    return finalENL;
  }
}
