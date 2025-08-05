import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import { ImpactCalculationRepository } from 'modules/impact/calculation/impact-calculation.repository';
import {
  CalculationContext,
  IndicatorCalculationStrategy,
  PreCalculationContext,
  PreCalculationResult,
} from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';

export class ForestLandscapeIntegrityLossStrategy extends IndicatorCalculationStrategy {
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.FLIL;
  executionPriority: number = 1; //depends on LF, so set priority to 1 to execute later

  constructor(
    indicator: Indicator,
    calculationRepository: ImpactCalculationRepository,
  ) {
    super(indicator, calculationRepository);
  }

  async preCalculate(
    context: PreCalculationContext,
  ): Promise<PreCalculationResult> {
    const { materialId, geoRegionId } = context;

    const indicatorH3DataSource =
      await this.calculationRepository.getIndicatorH3DataSource(
        this.indicatorCode,
      );

    // Get required arguments for calculations (h3 index, h3 data sources...)
    const geoRegionH3IndexList =
      await this.calculationRepository.getGeoRegionH3IndexList({
        geoRegionId,
      });
    const productionH3DataSource =
      await this.calculationRepository.getMaterialH3DataSource(
        materialId,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );

    const production = await this.calculationRepository.sumH3GridOverGeoRegion({
      geoRegionH3IndexList,
      materialH3DataSource: productionH3DataSource,
    });

    const rawFLIL =
      await this.calculationRepository.getAnnualCommodityWeightedImpactOverGeoRegion(
        indicatorH3DataSource,
        productionH3DataSource,
        geoRegionH3IndexList,
      );

    return {
      calculatedValues: {
        rawBaseValue: rawFLIL,
        production: production,
      },
    };
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
  async calculate(context: CalculationContext): Promise<number> {
    const { calculatedImpacts, preCalculationValues } = context;
    const production = preCalculationValues.calculatedValues.production;
    const rawFLIL = preCalculationValues.calculatedValues.rawBaseValue;

    // Grab the raw LF value from the calculated impacts so far
    const calculatedLF = calculatedImpacts.get(INDICATOR_NAME_CODES.LF);
    if (!calculatedLF) {
      throw new Error(
        `Missing calculated impact for ${INDICATOR_NAME_CODES.LF} when calculating ${this.indicatorCode}`,
      );
    }

    // Compute the normalized impact as rawFLIL / production, guarding against division by zero.
    const preProcessed =
      production.value !== 0 &&
      Number.isFinite(rawFLIL.value / production.value)
        ? rawFLIL.value / production.value
        : 0;

    return preProcessed * calculatedLF;
  }
}
