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

export class WaterGapToUnsustainableWaterUseStrategy extends IndicatorCalculationStrategy {
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.WGUWU;
  executionPriority: number = 1; // depends on WW, set to 1 to execute later
  useDistributedImpact: boolean;

  constructor(
    indicator: Indicator,
    calculationRepository: ImpactCalculationRepository,
  ) {
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

    ////////////////
    // NOTE: this indicator uses the UWU indicator H3 data as the source instead of WGUWU
    ///////////////
    const indicatorH3DataSource =
      await this.calculationRepository.getIndicatorH3DataSource(
        INDICATOR_NAME_CODES.UWU,
      );

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
    let rawWGUWU: TotalWeightedImpact | DistributedImpactValue;
    if (production.value > 0) {
      rawWGUWU =
        await this.calculationRepository.getAnnualCommodityWeightedImpactOverGeoRegion(
          indicatorH3DataSource,
          productionH3DataSource,
          geoRegionH3IndexList,
        );
    } else {
      rawWGUWU = this.useDistributedImpact
        ? await this.calculationRepository.getDistributedImpactOverGeoRegion(
            indicatorH3DataSource,
            geoRegionH3IndexList,
          )
        : new DistributedImpactValue(0);
    }

    return {
      calculatedValues: {
        rawBaseValue: rawWGUWU,
        production: production,
      },
    };
  }

  /**
   * Calculates the final WGUWU indicator value using the provided calculation context.
   * The calculation is based on:
   *   - waterWithdrawalValue = raw WW value * tonnage.
   *   - Final WGUWU = (raw WGUWU value * waterWithdrawalValue) / (100 * production),
   *     with safeguards against division by zero.
   *
   * @param context - Calculation context containing rawData, tonnage, production, etc.
   * @returns The calculated WGUWU value.
   */
  async calculate(context: CalculationContext): Promise<number> {
    const { calculatedImpacts, preCalculationValues } = context;
    const production = preCalculationValues.calculatedValues.production;
    const rawWGUWU = preCalculationValues.calculatedValues.rawBaseValue;

    // Grab the raw WW value from the calculated impacts so far
    const calculatedWW = calculatedImpacts.get(INDICATOR_NAME_CODES.WW);
    if (
      calculatedWW === undefined ||
      calculatedWW === null ||
      isNaN(calculatedWW)
    ) {
      throw new Error(
        `Missing calculated impact for ${INDICATOR_NAME_CODES.WW} when calculating ${this.indicatorCode}`,
      );
    }

    const finalValue =
      production.value > 0
        ? (rawWGUWU.value * calculatedWW) / (100 * production.value) || 0
        : rawWGUWU.value * (calculatedWW / 100) || 0;

    return finalValue;
  }
}
