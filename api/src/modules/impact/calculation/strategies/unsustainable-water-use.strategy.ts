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

/**
 * UWUIndicatorStrategy implements the calculation for the UWU indicator.
 *
 * It defines:
 *   - Query dependencies: to fetch the raw UWU value via its stored procedure,
 *     the production value, and the WU value (needed for calculating waterUseValue).
 *   - Arithmetic calculation:
 *       1. waterUseValue = raw WU value * tonnage.
 *       2. Final UWU = (raw UWU value * waterUseValue) / (100 * production),
 *          with safeguards against division by zero.
 */
export class UnsustainableWaterUseStrategy extends IndicatorCalculationStrategy {
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.UWU;
  executionPriority: number = 1; //depends on WU, set to 1 to execute later
  useDistributedImpact: boolean;

  constructor(
    indicator: Indicator,
    calculationRepository: ImpactCalculationRepository,
  ) {
    // this indicator has a dependency on WU, set the priority to 1 to be executed later
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
    let rawUWU: TotalWeightedImpact | DistributedImpactValue;
    if (production.value > 0) {
      rawUWU =
        await this.calculationRepository.getAnnualCommodityWeightedImpactOverGeoRegion(
          indicatorH3DataSource,
          productionH3DataSource,
          geoRegionH3IndexList,
        );
    } else {
      rawUWU = this.useDistributedImpact
        ? await this.calculationRepository.getDistributedImpactOverGeoRegion(
            indicatorH3DataSource,
            geoRegionH3IndexList,
          )
        : new DistributedImpactValue(0);
    }

    return {
      calculatedValues: {
        rawBaseValue: rawUWU,
        production: production,
      },
    };
  }

  /**
   * Calculates the final UWU indicator value using the provided calculation context.
   * The calculation is based on:
   *   - waterUseValue = raw WU value * tonnage.
   *   - Final UWU = (raw UWU value * waterUseValue) / (100 * production),
   *     with safeguards against division by zero.
   *
   * @param context - Calculation context containing rawData, tonnage, production, etc.
   * @returns The calculated UWU value.
   */
  async calculate(context: CalculationContext): Promise<number> {
    const { calculatedImpacts, preCalculationValues } = context;
    const production = preCalculationValues.calculatedValues.production;
    const rawUWU = preCalculationValues.calculatedValues.rawBaseValue;

    // Grab the raw WU value from the calculated impacts so far
    const calculatedWU = calculatedImpacts.get(INDICATOR_NAME_CODES.WU);
    if (
      calculatedWU === undefined ||
      calculatedWU === null ||
      isNaN(calculatedWU)
    ) {
      throw new Error(
        `Missing calculated impact for ${INDICATOR_NAME_CODES.WU} when calculating ${this.indicatorCode}`,
      );
    }

    // Calculate UWU value, ensuring no division by zero.
    const finalUWU =
      production.value > 0
        ? (rawUWU.value * calculatedWU) / (100 * production.value) || 0
        : rawUWU.value * (calculatedWU / 100) || 0;

    return finalUWU;
  }
}
