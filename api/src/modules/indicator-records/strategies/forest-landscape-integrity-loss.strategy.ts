import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { ImpactQueryExpression } from 'modules/indicator-records/services/impact-calculation.dependencies';
import {
  CalculationContext,
  IIndicatorCalculationStrategy,
} from 'modules/indicator-records/strategies/indicator-calculation.strategy.interface';
import { LandUseFootprintForProductionStrategy } from './land-use-footprint-for-production.strategy';

/**
 * FLILIndicatorStrategy implements the calculation for the FLIL indicator.
 *
 * It defines:
 *   - Query dependencies: to fetch the raw FLIL value, along with production and harvest raw values.
 *   - Arithmetic calculation: calculates a normalized value by dividing the raw FLIL value by production,
 *     and then multiplies it by the LF value obtained via the static helper in the LF strategy.
 */
export class ForestLandscapeIntegrityLossStrategy
  implements IIndicatorCalculationStrategy
{
  // Unique indicator code for FLIL
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.FLIL;

  /**
   * Returns the query fragments needed to obtain the raw values for FLIL.
   */
  getRawQueries(): ImpactQueryExpression[] {
    return [
      // Query to obtain the raw FLIL value via the stored procedure,
      // using the internal indicatorCode for aliasing.
      `get_annual_commodity_weighted_impact_over_georegion($1, '${this.indicatorCode}', $2, 'producer') as "${this.indicatorCode}"`,
      // Query to obtain the production value.
      `sum_material_over_georegion($1, $2, 'producer') as "production"`,
      // Query to obtain the harvest value (required for LF calculation).
      `sum_material_over_georegion($1, $2, 'harvest') as "harvest"`,
    ];
  }

  /**
   * Calculates the final FLIL indicator value using the provided calculation context.
   * The calculation is based on:
   *   - LF value: obtained by calling LandUseFootprintForProductionStrategy.calculateLF(context)
   *   - normalizedImpact = (raw FLIL value / production) if production is valid, else 0
   *   - Final FLIL = normalizedImpact * LF
   *
   * @param context - Calculation context containing rawData, tonnage, production, etc.
   * @returns The calculated FLIL value.
   */
  calculate(context: CalculationContext): number {
    const { rawData, production } = context;

    // Use the static helper from the LF strategy to calculate LF.
    const lf = LandUseFootprintForProductionStrategy.calculateLF(context);

    // Get the raw FLIL value from the raw data.
    const rawFLIL = rawData[INDICATOR_NAME_CODES.FLIL];

    // Compute the normalized impact as rawFLIL / production, guarding against division by zero.
    const normalizedImpact =
      production !== 0 && Number.isFinite(rawFLIL / production)
        ? rawFLIL / production
        : 0;

    return normalizedImpact * lf;
  }
}
