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

export class GhgFarmManagementStrategy extends IndicatorCalculationStrategy {
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.GHG_FARM;
  executionPriority: number = 0; // has no dependencies, set to 0 to execute earlier

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

    // This indicator uses the MaterialIndicator H3 data instead of Material H3 data as the base for the production value
    const materialIndicatorH3DataSource =
      await this.calculationRepository.getMaterialIndicatorH3DataSource(
        new IndicatorId(this.indicator.id),
        materialId,
      );

    const production = await this.calculationRepository.sumH3GridOverGeoRegion({
      geoRegionH3IndexList,
      materialH3DataSource: materialIndicatorH3DataSource,
    });

    //Calculate the raw base value
    const rawGHGFarm =
      await this.calculationRepository.getAnnualCommodityWeightedImpactOverGeoRegion(
        indicatorH3DataSource,
        materialIndicatorH3DataSource,
        geoRegionH3IndexList,
      );

    return {
      calculatedValues: {
        rawBaseValue: rawGHGFarm,
        production: production,
      },
    };
  }

  /**
   * Calculates the final GHG_FARM indicator value using the provided calculation context.
   * The calculation is based on:
   *   - preProcessed = (raw GHG_FARM value / production) if production is valid, else 0
   *   - Final GHG_FARM = preProcessed * tonnage
   *
   * @param context - Calculation context containing rawData, tonnage, production, etc.
   * @returns The calculated GHG_FARM value.
   */
  async calculate(context: CalculationContext): Promise<number> {
    const { tonnage, preCalculationValues } = context;
    const production = preCalculationValues.calculatedValues.production;
    const rawGHGFarm = preCalculationValues.calculatedValues.rawBaseValue;

    // Compute the normalized value (preProcessed) by dividing the raw value by production,
    // guarding against division by zero.
    const preProcessed =
      production.value !== 0 &&
      Number.isFinite(rawGHGFarm.value / production.value)
        ? rawGHGFarm.value / production.value
        : 0;

    return preProcessed * tonnage || 0;
  }
}
