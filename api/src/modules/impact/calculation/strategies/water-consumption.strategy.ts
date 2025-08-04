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
 * WCIndicatorStrategy implements the calculation for the WC indicator.
 *
 * It defines:
 *   - Query dependency: to fetch the raw WC value using a stored procedure.
 *   - Arithmetic calculation: calculates the final WC value by multiplying the raw WC value by the tonnage.
 */
export class WaterConsumptionStrategy extends IndicatorCalculationStrategy {
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.WC;
  executionPriority: number = 0; //no dependencies, set to 0 to execute earlier

  constructor(
    indicator: Indicator,
    calculationRepository: ImpactCalculationRepository,
  ) {
    // This indicator has no dependencies, so priority is set to 0 to be executed first
    super(indicator, calculationRepository);
  }

  async preCalculate(
    context: PreCalculationContext,
  ): Promise<PreCalculationResult> {
    const { materialId, adminRegionId } = context;

    // calculate raw base value
    const rawWC =
      await this.calculationRepository.getIndicatorCoefficientImpact({
        adminRegionId,
        materialId,
        indicatorId: new IndicatorId(this.indicator.id),
      });

    return {
      calculatedValues: {
        rawBaseValue: rawWC,
      },
    };
  }

  /**
   * Calculates the final WC indicator value using the provided calculation context.
   * The calculation is based on:
   *   - Final WC = raw WC value * tonnage
   *
   * @param context - Calculation context containing rawData and tonnage.
   * @returns The calculated WC value.
   */
  async calculate(context: CalculationContext): Promise<number> {
    const { tonnage, preCalculationValues } = context;
    const rawWC = preCalculationValues.calculatedValues.rawBaseValue;

    return rawWC.value * tonnage || 0;
  }
}
