import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { ImpactQueryExpression } from 'modules/indicator-records/services/impact-calculation.dependencies';
import {
  CalculationContext,
  IIndicatorCalculationStrategy,
} from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';

/**
 * GHG_FarmIndicatorStrategy implements the calculation for the GHG_FARM indicator.
 *
 * It defines:
 *   - Query dependencies: to fetch the raw GHG_FARM value via a stored procedure,
 *     along with production (and optionally harvest).
 *   - Arithmetic calculation: normalizes the raw GHG_FARM value by dividing it by production,
 *     then multiplies by the tonnage.
 */
export class GhgFarmManagementStrategy
  implements IIndicatorCalculationStrategy
{
  // Unique indicator code for GHG_FARM
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.GHG_FARM;

  /**
   * Returns the query fragments needed to obtain the raw values for GHG_FARM.
   */
  getRawQueries(): ImpactQueryExpression[] {
    return [
      // Query to obtain the raw GHG_FARM value via the stored procedure.
      `get_annual_commodity_weighted_material_impact_over_georegion($1, '${this.indicatorCode}', $2, 'producer') as "${this.indicatorCode}"`,
      // Query to obtain the production value.
      `sum_material_over_georegion($1, $2, 'producer') as "production"`,
      // (Optional) Query to obtain the harvest value, if needed for consistency.
      `sum_material_over_georegion($1, $2, 'harvest') as "harvest"`,
    ];
  }

  /**
   * Calculates the final GHG_FARM indicator value using the provided calculation context.
   * The calculation is based on:
   *   - preProcessed = (raw GHG_FARM value / production) if production is valid, else 0
   *   - Final GHG_FARM = preProcessed * tonnage
   *
   * @param context - Calculation context containing rawData, tonnage, production, etc.
   * @returns The calculated GHG_FARM value.
   */
  calculate(context: CalculationContext): number {
    const { rawData, tonnage, production } = context;

    // Retrieve the raw GHG_FARM value from raw data.
    const rawGHGFarm = rawData[this.indicatorCode];

    // Compute the normalized value (preProcessed) by dividing the raw value by production,
    // guarding against division by zero.
    const preProcessed =
      production !== 0 && Number.isFinite(rawGHGFarm / production)
        ? rawGHGFarm / production
        : 0;

    return preProcessed * tonnage || 0;
  }
}
