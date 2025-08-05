import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import {
  ImpactCalculationRepository,
  IndicatorId,
} from 'modules/impact/calculation/impact-calculation.repository';
import {
  CalculationContext,
  IndicatorCalculationStrategy,
  PreCalculationContext,
  PreCalculationResult,
} from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';

/**
 * NLIndicatorStrategy implements the calculation for the NL indicator.
 *
 * It defines:
 *   - Query dependency: to fetch the raw NL value using a stored procedure.
 *   - Arithmetic calculation: calculates the final NL value by simply multiplying the raw NL value by the tonnage.
 */
export class NutrientLoadStrategy extends IndicatorCalculationStrategy {
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.NL;
  executionPriority: number = 0; //no dependencies, set to 0 to execute earlier

  constructor(
    indicator: Indicator,
    calculationRepository: ImpactCalculationRepository,
  ) {
    super(indicator, calculationRepository);
  }

  async preCalculate(
    context: PreCalculationContext,
  ): Promise<PreCalculationResult> {
    const { materialId, adminRegionId } = context;

    // calculate raw base value
    const rawNL =
      await this.calculationRepository.getIndicatorCoefficientImpact({
        adminRegionId,
        materialId,
        indicatorId: new IndicatorId(this.indicator.id),
      });
    return {
      calculatedValues: {
        rawBaseValue: rawNL,
      },
    };
  }

  /**
   * Calculates the final NL indicator value using the provided calculation context.
   * The calculation is based on:
   *   - Final NL = raw NL value * tonnage
   *
   * @param context - Calculation context containing rawData and tonnage.
   * @returns The calculated NL value.
   */
  async calculate(context: CalculationContext): Promise<number> {
    const { tonnage, preCalculationValues } = context;
    const rawNL = preCalculationValues.calculatedValues.rawBaseValue;

    return rawNL.value * tonnage || 0;
  }
}
