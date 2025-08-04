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

export class WaterWithdrawalsStrategy extends IndicatorCalculationStrategy {
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.WW;
  executionPriority: number = 0; // no dependencies, set to 0 to execute earlier

  constructor(
    indicator: Indicator,
    calculationRepository: ImpactCalculationRepository,
  ) {
    //this indicator has no dependencies, so priority is set to 0 to be executed first
    super(indicator, calculationRepository);
  }

  async preCalculate(
    context: PreCalculationContext,
  ): Promise<PreCalculationResult> {
    const { materialId, adminRegionId } = context;

    // calculate raw base value
    const rawWW =
      await this.calculationRepository.getIndicatorCoefficientImpact({
        adminRegionId,
        materialId,
        indicatorId: new IndicatorId(this.indicator.id),
      });

    return {
      calculatedValues: {
        rawBaseValue: rawWW,
      },
    };
  }

  /**
   * Calculates the final WW indicator value using the provided calculation context.
   * The calculation is based on:
   *   - Final WW = raw WW value * tonnage
   *
   * @param context - Calculation context containing rawData and tonnage.
   * @returns The calculated WW value.
   */
  async calculate(context: CalculationContext): Promise<number> {
    const { tonnage, preCalculationValues } = context;

    const rawWW = preCalculationValues.calculatedValues.rawBaseValue;

    return rawWW.value * tonnage || 0;
  }
}
