// Import the Indicator type and indicator codes
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import { Injectable } from '@nestjs/common';
import { IndicatorCalculationStrategy } from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';
import { ImpactCalculationRepository } from 'modules/impact/calculation/impact-calculation.repository';
import { DeforestationFootprintStrategy } from 'modules/impact/calculation/strategies/deforestation-footprint.strategy';
import { LandUseFootprintForProductionStrategy } from 'modules/impact/calculation/strategies/land-use-footprint-for-production.strategy';
import { GHGDeforestationStrategy } from 'modules/impact/calculation/strategies/ghg-deforestation.strategy';
import { NetCroplandExpansionStrategy } from 'modules/impact/calculation/strategies/net-cropland-expansion.strategy';
import { ForestLandscapeIntegrityLossStrategy } from 'modules/impact/calculation/strategies/forest-landscape-integrity-loss.strategy';
import { GhgFarmManagementStrategy } from 'modules/impact/calculation/strategies/ghg-farm-management.strategy';
import { WaterUseStrategy } from 'modules/impact/calculation/strategies/water-use.strategy';
import { UnsustainableWaterUseStrategy } from 'modules/impact/calculation/strategies/unsustainable-water-use.strategy';
import { NutrientLoadStrategy } from 'modules/impact/calculation/strategies/nutrient-load.strategy';
import { ExcessNutrientLoadStrategy } from 'modules/impact/calculation/strategies/excess-nutrient-load.strategy';
import { WaterWithdrawalsStrategy } from 'modules/impact/calculation/strategies/water-withdrawals.strategy';
import { WaterConsumptionStrategy } from 'modules/impact/calculation/strategies/water-consumption.strategy';
import { WaterGapToUnsustainableWaterUseStrategy } from 'modules/impact/calculation/strategies/water-gap-to-unsustainable-water-use.strategy';
import { WaterGapToSustainableWaterUseNewStrategy } from 'modules/impact/calculation/strategies/water-gap-to-sustainable-water-use-new.strategy';

/**
 * ImpactCalculationRegistry dynamically instantiates and returns strategy instances
 * based on the active indicators provided.
 */
@Injectable()
export class IndicatorStrategyFactory {
  constructor(
    private readonly calculationRepository: ImpactCalculationRepository,
  ) {}

  private strategyMap: Record<
    INDICATOR_NAME_CODES,
    new (
      indicator: Indicator,
      calculationRepository: ImpactCalculationRepository,
    ) => IndicatorCalculationStrategy
  > = {
    [INDICATOR_NAME_CODES.LF]: LandUseFootprintForProductionStrategy,
    [INDICATOR_NAME_CODES.DF_SLUC]: DeforestationFootprintStrategy,
    [INDICATOR_NAME_CODES.GHG_DEF_SLUC]: GHGDeforestationStrategy,
    [INDICATOR_NAME_CODES.NCE]: NetCroplandExpansionStrategy,
    [INDICATOR_NAME_CODES.FLIL]: ForestLandscapeIntegrityLossStrategy,
    [INDICATOR_NAME_CODES.GHG_FARM]: GhgFarmManagementStrategy,
    [INDICATOR_NAME_CODES.WU]: WaterUseStrategy,
    [INDICATOR_NAME_CODES.UWU]: UnsustainableWaterUseStrategy,
    [INDICATOR_NAME_CODES.NL]: NutrientLoadStrategy,
    [INDICATOR_NAME_CODES.ENL]: ExcessNutrientLoadStrategy,
    [INDICATOR_NAME_CODES.WW]: WaterWithdrawalsStrategy,
    [INDICATOR_NAME_CODES.WC]: WaterConsumptionStrategy,
    [INDICATOR_NAME_CODES.WGUWU]: WaterGapToUnsustainableWaterUseStrategy,
    [INDICATOR_NAME_CODES.WGSWU_NEW]: WaterGapToSustainableWaterUseNewStrategy,
  };

  /**
   * Returns a map of strategy instances corresponding to the active indicators.
   *
   * @param activeIndicators Array of active Indicators
   * @returns Map of instantiated IIndicatorCalculationStrategy objects
   */
  public getStrategies(activeIndicators: Indicator[]): IndicatorStrategyMap {
    const strategyMap: IndicatorStrategyMap = new IndicatorStrategyMap();
    // TODO: right now, for simplicity, it is assumed that indicators that are a dependency of other indicators will
    // also be present in the list of active indicators. This might not always be the case, and in the future we should adapt
    // the logic to include this indicator dependencies in the calculation process, but *not save them* in the database.

    for (const activeIndicator of activeIndicators) {
      const strategyClass = this.strategyMap[activeIndicator.nameCode];
      if (strategyClass) {
        strategyMap.set(
          activeIndicator.nameCode,
          new strategyClass(activeIndicator, this.calculationRepository),
        );
      }
    }

    return strategyMap;
  }
}

export class IndicatorStrategyMap {
  map: Map<INDICATOR_NAME_CODES, IndicatorCalculationStrategy>;

  constructor() {
    this.map = new Map();
  }

  has(key: INDICATOR_NAME_CODES): boolean {
    return this.map.has(key);
  }

  set(key: INDICATOR_NAME_CODES, val: IndicatorCalculationStrategy): void {
    this.map.set(key, val);
  }

  get(key: INDICATOR_NAME_CODES): IndicatorCalculationStrategy | undefined {
    return this.map.get(key);
  }

  // Returns the list of strategies in the map, sorted by priority. Smaller Values are more prioritary.
  getSortedStrategies(): IndicatorCalculationStrategy[] {
    const sortedStrategies = Array.from(this.map.values()).sort(
      (a, b) => a.executionPriority - b.executionPriority,
    );
    return sortedStrategies;
  }
}
