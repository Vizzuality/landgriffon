import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import {
  DistributedImpactValue,
  ImpactCalculationRepository,
  TotalWeightedImpact,
} from 'modules/impact/calculation/impact-calculation.repository';
import {
  CalculationContext,
  IndicatorCalculationStrategy,
  PreCalculationContext,
  PreCalculationResult,
} from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { AppConfig } from 'utils/app.config';

export class ExcessNutrientLoadStrategy extends IndicatorCalculationStrategy {
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.ENL;
  executionPriority: number = 1; //depends on NL, set to 1 to be executed later
  useDistributedImpact: boolean;

  constructor(
    indicator: Indicator,
    calculationRepository: ImpactCalculationRepository,
  ) {
    // this indicator has a dependency on NL, set the priority to 1 to be executed later
    super(indicator, calculationRepository);
    this.useDistributedImpact = AppConfig.getBoolean(
      'flags.useDistributedImpact',
      false,
    );
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

    // calculate the raw base value IF production > 0, otherwise calculate the distributed value is the app flag is set
    let rawENL: TotalWeightedImpact | DistributedImpactValue;
    if (production.value > 0) {
      rawENL =
        await this.calculationRepository.getAnnualCommodityWeightedImpactOverGeoRegion(
          indicatorH3DataSource,
          productionH3DataSource,
          geoRegionH3IndexList,
        );
    } else {
      rawENL = this.useDistributedImpact
        ? await this.calculationRepository.getDistributedImpactOverGeoRegion(
            indicatorH3DataSource,
            geoRegionH3IndexList,
          )
        : new DistributedImpactValue(0);
    }

    return {
      calculatedValues: {
        rawBaseValue: rawENL,
        production: production,
      },
    };
  }

  /**
   * Calculates the final ENL indicator value using the provided calculation context.
   * The calculation is based on:
   *   - nutrientLoad = raw NL value * tonnage.
   *   - Final ENL = (raw ENL value * nutrientLoad) / (100 * production),
   *     with safeguards against division by zero.
   *
   * @param context - Calculation context containing rawData, tonnage, production, etc.
   * @returns The calculated ENL value.
   */
  async calculate(context: CalculationContext): Promise<number> {
    const { calculatedImpacts, preCalculationValues } = context;
    const production = preCalculationValues.calculatedValues.production;
    const rawENL = preCalculationValues.calculatedValues.rawBaseValue;

    // Grab the raw NL value from the calculated impacts so far
    const calculatedNL = calculatedImpacts.get(INDICATOR_NAME_CODES.NL);
    if (!calculatedNL) {
      throw new Error(
        `Missing calculated impact for ${INDICATOR_NAME_CODES.NL} when calculating ${this.indicatorCode}`,
      );
    }

    return production.value > 0
      ? (rawENL.value * calculatedNL) / (100 * production.value) || 0
      : rawENL.value * (calculatedNL / 100) || 0;
  }
}
