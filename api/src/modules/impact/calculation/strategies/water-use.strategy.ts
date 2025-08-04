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

export class WaterUseStrategy extends IndicatorCalculationStrategy {
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.WU;
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
    const rawWU =
      await this.calculationRepository.getIndicatorCoefficientImpact({
        adminRegionId,
        materialId,
        indicatorId: new IndicatorId(this.indicator.id),
      });
    return {
      calculatedValues: {
        rawBaseValue: rawWU,
      },
    };
  }

  /**
   * Calculates the final WU indicator value using the provided calculation context.
   * The calculation is based on:
   *   - Final WU = raw WU value * tonnage (if the product is falsy, returns 0).
   *
   * @param context - Calculation context containing rawData and tonnage.
   * @returns The calculated WU value.
   */
  async calculate(context: CalculationContext): Promise<number> {
    const { tonnage, preCalculationValues } = context;

    const rawWU = preCalculationValues.calculatedValues.rawBaseValue;

    return rawWU.value * tonnage || 0;
  }
}
