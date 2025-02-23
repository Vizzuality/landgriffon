import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { ImpactQueryExpression } from 'modules/indicator-records/services/impact-calculation.dependencies';
import {
  CalculationContext,
  IIndicatorCalculationStrategy,
} from 'modules/indicator-records/strategies/indicator-calculation.strategy.interface';
import { LandUseFootprintForProductionStrategy } from 'modules/indicator-records/strategies/land-use-footprint-for-production.strategy';

/**
 * GHGDeforestationStrategy implements the calculation for the GHG_DEF indicator.
 *
 * It defines:
 *   - Query dependencies: to fetch the raw GHG_DEF value, along with production and harvest raw values.
 *   - Arithmetic calculation: calculates a pre-processed value by dividing the raw GHG_DEF value by production (if valid),
 *     then multiplies it by the LF value obtained from the static helper in the LF strategy.
 */
export class GHGDeforestationStrategy implements IIndicatorCalculationStrategy {
  // Unique indicator code for GHG_DEF
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.GHG_DEF_SLUC;

  /**
   * Returns the query fragments needed to obtain the raw values for GHG_DEF.
   */
  getRawQueries(): ImpactQueryExpression[] {
    return [
      // Query to obtain the raw GHG_DEF value via the stored procedure.
      `get_annual_commodity_weighted_impact_over_georegion($1, '${this.indicatorCode}', $2, 'producer') as "${this.indicatorCode}"`,
      // Query to obtain the production value.
      `sum_material_over_georegion($1, $2, 'producer') as "production"`,
      // Query to obtain the harvest value (needed for LF calculation).
      `sum_material_over_georegion($1, $2, 'harvest') as "harvest"`,
    ];
  }

  /**
   * Calculates the final GHG_DEF indicator value using the provided calculation context.
   * The calculation is based on:
   *   - LF value: obtained by calling LandUseFootprintForProductionStrategy.calculateLF(context)
   *   - preProcessed = (raw GHG_DEF value / production) if production is valid, else 0
   *   - Final GHG_DEF = preProcessed * LF
   *
   * @param context - Calculation context containing rawData, tonnage, production, etc.
   * @returns The calculated GHG_DEF value.
   */
  calculate(context: CalculationContext): number {
    const { rawData, production } = context;

    // Use the static helper from LF strategy to calculate LF.
    const lf = LandUseFootprintForProductionStrategy.calculateLF(context);

    // Get the raw GHG_DEF value from the raw data.
    const rawGHG_DEF = rawData[INDICATOR_NAME_CODES.GHG_DEF_SLUC];

    // Compute the pre-processed value as rawGHG_DEF / production, avoiding division by zero.
    const preProcessed =
      production !== 0 && Number.isFinite(rawGHG_DEF / production)
        ? rawGHG_DEF / production
        : 0;

    return preProcessed * lf;
  }
}
