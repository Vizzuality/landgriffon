import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import {
  CalculationContext,
  IndicatorCalculationStrategy,
  PreCalculationContext,
  PreCalculationResult,
} from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';
import { ImpactCalculationRepository } from 'modules/impact/calculation/impact-calculation.repository';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';

export class DeforestationFootprintStrategy extends IndicatorCalculationStrategy {
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.DF_SLUC;
  executionPriority: number = 1; // depends on LF, set to 1 to be executed later

  constructor(
    indicator: Indicator,
    calculationRepository: ImpactCalculationRepository,
  ) {
    super(indicator, calculationRepository);
  }

  async preCalculate(
    context: PreCalculationContext,
  ): Promise<PreCalculationResult> {
    const { geoRegionId, materialId } = context;

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
    const rawDF_SLUC =
      await this.calculationRepository.getAnnualCommodityWeightedImpactOverGeoRegion(
        indicatorH3DataSource,
        productionH3DataSource,
        geoRegionH3IndexList,
      );

    return {
      calculatedValues: {
        rawBaseValue: rawDF_SLUC,
        production: production,
      },
    };
  }

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
  async calculate(context: CalculationContext): Promise<number> {
    const { calculatedImpacts, preCalculationValues } = context;
    const production = preCalculationValues.calculatedValues.production;
    const rawDF_SLUC = preCalculationValues.calculatedValues.rawBaseValue;

    // Grab the raw LF value from the calculated impacts so far
    const calculatedLF = calculatedImpacts.get(INDICATOR_NAME_CODES.LF);
    if (!calculatedLF) {
      throw new Error(
        `Missing calculated impact for ${INDICATOR_NAME_CODES.LF} when calculating ${this.indicatorCode}`,
      );
    }

    // Compute pre-processed DF_SLUC value as raw DF_SLUC divided by production, if valid.
    const preProcessed =
      production.value !== 0 &&
      Number.isFinite(rawDF_SLUC.value / production.value)
        ? rawDF_SLUC.value / production.value
        : 0;

    return preProcessed * calculatedLF;
  }
}
