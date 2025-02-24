// Import the Indicator type and indicator codes
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
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
  };

  /**
   * Returns an array of strategy instances corresponding to the active indicators.
   *
   * @param activeIndicators Array of active Indicator objects (each with a nameCode property)
   * @returns Array of instantiated IIndicatorCalculationStrategy objects
   */
  public getStrategies(
    activeIndicators: Indicator[],
  ): IIndicatorCalculationStrategy[] {
    // Create a Set of active indicator codes for quick lookup
    const activeCodes = new Set(
      activeIndicators.map((ind: Indicator) => ind.nameCode),
    );

    const strategies: IIndicatorCalculationStrategy[] = [];
    // Loop over the mapping and instantiate the strategies for active codes
    for (const code in this.strategyMap) {
      if (activeCodes.has(code as INDICATOR_NAME_CODES)) {
        const StrategyClass = this.strategyMap[code as INDICATOR_NAME_CODES];
        strategies.push(new StrategyClass());
      }
    }
    return strategies;
  }
}
