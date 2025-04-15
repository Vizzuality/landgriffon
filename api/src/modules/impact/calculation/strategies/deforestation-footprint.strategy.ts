import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { ImpactQueryExpression } from 'modules/indicator-records/services/impact-calculation.dependencies';
import {
  CalculationContext,
  IIndicatorCalculationStrategy,
} from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';
import { LandUseFootprintForProductionStrategy } from 'modules/impact/calculation/strategies/land-use-footprint-for-production.strategy';

/**
 * DF_SLUCStrategy implements the calculation for the DF_SLUC indicator.
 *
 * It defines:
 *   - Query dependencies: to fetch the raw DF_SLUC value, along with production and harvest raw values.
 *   - Arithmetic calculation: first, it computes a pre-processed value by dividing the raw DF_SLUC value by production (if valid).
 *     Then it computes the LF value as (harvest / production) * tonnage.
 *     Finally, the DF_SLUC value is calculated as:
 *         DF_SLUC = preProcessed * LF.
 */
export class DeforestationFootprintStrategy
  implements IIndicatorCalculationStrategy
{
  // Unique indicator code for DF_SLUC
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.DF_SLUC;

  /**
   * Calculates the final DF_SLUC indicator value using the provided calculation context.
   * The calculation is based on:
   *   - LF = (harvest / production) * tonnage (computed if production is valid)
   *   - preProcessed = (raw DF_SLUC value / production) if production > 0 and finite, else 0
   *   - Final DF_SLUC = preProcessed * LF
   *
   * @param context - Calculation context containing rawData, tonnage, production, etc.
   * @returns The calculated DF_SLUC value.
   */
  calculate(context: CalculationContext): number {
    const { rawData, tonnage, production } = context;
    const harvest = rawData.harvest;

    /**
     * Returns the query fragments needed to obtain the raw values for DF_SLUC.
     */

    // TODO: LF and PreProcessed (change name) are computed several times for each indicator. consider tradeoff between recalculating and passing the precomputed
    //.      value somehow

    // Compute LF value as (harvest / production) * tonnage, avoiding division by zero.
    // const lf =
    //   production !== 0 && Number.isFinite(harvest / production)
    //     ? (harvest / production) * tonnage
    //     : 0;
    const lf: number =
      LandUseFootprintForProductionStrategy.calculateLF(context);

    // Compute pre-processed DF_SLUC value as raw DF_SLUC divided by production, if valid.
    const rawDF_SLUC = rawData[this.indicatorCode];
    const preProcessed =
      production !== 0 && Number.isFinite(rawDF_SLUC / production)
        ? rawDF_SLUC / production
        : 0;

    return preProcessed * lf;
  }

  getRawQueries(): ImpactQueryExpression[] {
    return [
      // Query to obtain the raw DF_SLUC value using the stored procedure.
      `get_annual_commodity_weighted_impact_over_georegion($1, '${this.indicatorCode}', $2, 'producer') as "${this.indicatorCode}"`,
      // Query to obtain the production value.
      `sum_material_over_georegion($1, $2, 'producer') as "production"`,
      // Query to obtain the harvest value (required to compute LF).
      `sum_material_over_georegion($1, $2, 'harvest') as "harvest"`,
    ];
  }
}
