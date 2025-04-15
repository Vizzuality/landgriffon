// Import the Indicator type and indicator codes
import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { IIndicatorCalculationStrategy } from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';
import { LandUseFootprintForProductionStrategy } from 'modules/impact/calculation/strategies/land-use-footprint-for-production.strategy';
import { DeforestationFootprintStrategy } from 'modules/impact/calculation/strategies/deforestation-footprint.strategy';
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
import { Injectable } from '@nestjs/common';
import { ImpactQueryDependency } from './impact-calculation.query.builder';
import { DataSource } from 'typeorm';

export type IndicatorStrategyMap = Map<
  INDICATOR_NAME_CODES,
  IIndicatorCalculationStrategy
>;

/**
 * ImpactCalculationRegistry dynamically instantiates and returns strategy instances
 * based on the active indicators provided.
 */
@Injectable()
export class IndicatorStrategyFactory {
  private strategyMap: Record<
    INDICATOR_NAME_CODES,
    new () => IIndicatorCalculationStrategy
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
    [INDICATOR_NAME_CODES.WGSWU_NEW]: WaterGapToUnsustainableWaterUseStrategy,
  };

  /**
   * Returns a map of strategy instances corresponding to the active indicators.
   *
   * @param activeIndicatorNameCodes Array of active Indicator nameCodes
   * @param dataSource
   * @returns Map of instantiated IIndicatorCalculationStrategy objects
   */
  public getStrategies(
    activeIndicatorNameCodes: INDICATOR_NAME_CODES[],
    dataSource: DataSource,
  ): IndicatorStrategyMap2 {
    // Create a unique set of nameCodes in case there are duplicates
    const activeCodes = new Set(activeIndicatorNameCodes);

    const strategyMap: IndicatorStrategyMap2 = new IndicatorStrategyMap2();
    // Loop over the mapping and instantiate the strategies for active codes
    for (const code in this.strategyMap) {
      if (activeCodes.has(code as INDICATOR_NAME_CODES)) {
        const StrategyClass = this.strategyMap[code as INDICATOR_NAME_CODES];
        strategyMap.set(code as INDICATOR_NAME_CODES, new StrategyClass());
      }
    }
    return strategyMap;
  }
}

export class IndicatorStrategyMap2 {
  map: Map<INDICATOR_NAME_CODES, IIndicatorCalculationStrategy>;

  constructor() {
    this.map = new Map();
  }

  has(key: INDICATOR_NAME_CODES): boolean {
    return this.map.has(key);
  }

  set(key: INDICATOR_NAME_CODES, val: IIndicatorCalculationStrategy): void {
    this.map.set(key, val);
  }

  get(key: INDICATOR_NAME_CODES): IIndicatorCalculationStrategy | undefined {
    return this.map.get(key);
  }

  getQueryDependencies(): ImpactQueryDependency[] {
    const dependencies: ImpactQueryDependency[] = [];
    this.map.forEach((s) => {
      dependencies.push({ alias: s.indicatorCode, queries: s.getRawQueries() });
    });
    return dependencies;
  }
}
