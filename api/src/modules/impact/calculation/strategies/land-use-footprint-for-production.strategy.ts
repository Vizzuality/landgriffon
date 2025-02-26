import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { ImpactQueryExpression } from 'modules/indicator-records/services/impact-calculation.dependencies';
import {
  CalculationContext,
  IIndicatorCalculationStrategy,
} from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';

/**
 * LandUseFootprintForProductionStrategy implements the calculation for the LF indicator.
 *
 * It defines:
 *   - Query dependencies: to fetch "harvest" and "production" raw values.
 *   - Arithmetic calculation: calculates landPerTon = harvest / production (if finite)
 *     and then LF = landPerTon * tonnage.
 */
export class LandUseFootprintForProductionStrategy
  implements IIndicatorCalculationStrategy
{
  // Unique indicator code for LF
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.LF;

  /**
   * Returns the query fragments needed to obtain the raw values for LF.
   */

  // TODO: For simplicity (maybe) I will add all queries for each indicator, as opposed to what happens in the previous approach. discuss with the team
  // TODO: Maybe it's a good idea to check that all stored procedure dependencies are present at app start

  getRawQueries(): ImpactQueryExpression[] {
    return [
      `sum_material_over_georegion($1, $2, 'harvest') as "harvest"`,
      `sum_material_over_georegion($1, $2, 'producer') as "production"`,
    ];
  }

  /**
   * Calculates the final LF indicator value using the provided calculation context.
   * The calculation is based on:
   *   - landPerTon = harvest / production (if production > 0 and the result is finite)
   *   - LF = landPerTon * tonnage
   * @param context - Calculation context containing rawData and tonnage.
   * @returns The calculated LF value.
   */
  static calculateLF(context: CalculationContext): number {
    const { rawData, tonnage } = context;
    const production = rawData.production;
    const harvest = rawData.harvest;

    const landPerTon =
      production !== 0 && Number.isFinite(harvest / production)
        ? harvest / production
        : 0;

    return landPerTon * tonnage;
  }

  calculate(context: CalculationContext): number {
    return LandUseFootprintForProductionStrategy.calculateLF(context);
  }
}
