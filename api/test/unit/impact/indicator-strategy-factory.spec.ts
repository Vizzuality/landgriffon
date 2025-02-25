import { IndicatorStrategyFactory } from 'modules/impact/calculation/indicator.strategy.factory';
import { DeforestationFootprintStrategy } from 'modules/impact/calculation/strategies/deforestation-footprint.strategy';
import { GHGDeforestationStrategy } from 'modules/impact/calculation/strategies/ghg-deforestation.strategy';
import { LandUseFootprintForProductionStrategy } from 'modules/impact/calculation/strategies/land-use-footprint-for-production.strategy';
import { UnsustainableWaterUseStrategy } from 'modules/impact/calculation/strategies/unsustainable-water-use.strategy';
import {
  INDICATOR_NAME_CODES,
  Indicator,
} from 'modules/indicators/indicator.entity';
import { WaterUseStrategy } from '../../../src/modules/impact/calculation/strategies/water-use.strategy';
import { NetCroplandExpansionStrategy } from '../../../src/modules/impact/calculation/strategies/net-cropland-expansion.strategy';
import { ForestLandscapeIntegrityLossStrategy } from '../../../src/modules/impact/calculation/strategies/forest-landscape-integrity-loss.strategy';
import { GhgFarmManagementStrategy } from '../../../src/modules/impact/calculation/strategies/ghg-farm-management.strategy';
import { NutrientLoadStrategy } from '../../../src/modules/impact/calculation/strategies/nutrient-load.strategy';
import { ExcessNutrientLoadStrategy } from '../../../src/modules/impact/calculation/strategies/excess-nutrient-load.strategy';
import { WaterWithdrawalsStrategy } from '../../../src/modules/impact/calculation/strategies/water-withdrawals.strategy';
import { WaterConsumptionStrategy } from '../../../src/modules/impact/calculation/strategies/water-consumption.strategy';
import { WaterGapToUnsustainableWaterUseStrategy } from '../../../src/modules/impact/calculation/strategies/water-gap-to-unsustainable-water-use.strategy';
import { IIndicatorCalculationStrategy } from '../../../src/modules/impact/calculation/strategies/indicator-calculation.strategy.interface';

describe('IndicatorStrategyFactory', () => {
  let strategyFactory: IndicatorStrategyFactory;

  beforeEach(() => {
    strategyFactory = new IndicatorStrategyFactory();
  });

  test('should generate functional strategies based on active indicators', () => {
    const activeIndicators = [] as Indicator[];
    for (const nameCode of Object.values(INDICATOR_NAME_CODES)) {
      activeIndicators.push({ nameCode } as Indicator);
    }

    const strategies = strategyFactory.getStrategies(
      activeIndicators.map((i: Indicator) => i.nameCode),
    );

    expect(strategies).toHaveLength(Object.values(INDICATOR_NAME_CODES).length);
    const allQueries = strategies
      .map((s: IIndicatorCalculationStrategy) => s.getRawQueries())
      .flat();

    // Expect the total array of queries that all strategies must return so that if this changes, the test will fail just in case
    expect(allQueries).toHaveLength(30);
  });
  test('each indicator name code should instantiate the correct strategy', () => {
    const STRATEGY_MAP = {
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
    for (const [key, ExpectedClass] of Object.entries(STRATEGY_MAP)) {
      const strategy = strategyFactory.getStrategies([
        key as INDICATOR_NAME_CODES,
      ]);
      expect(strategy).toHaveLength(1);
      expect(strategy[0]).toBeInstanceOf(ExpectedClass);
    }
  });
  test('should create a unique set of strategies if repeated indicators are provided', () => {
    const activeIndicators = [
      { nameCode: INDICATOR_NAME_CODES.LF },
      { nameCode: INDICATOR_NAME_CODES.LF },
      { nameCode: INDICATOR_NAME_CODES.LF },
      { nameCode: INDICATOR_NAME_CODES.WU },
    ] as Indicator[];

    const strategies = strategyFactory.getStrategies(
      activeIndicators.map((i: Indicator) => i.nameCode),
    );

    expect(strategies).toHaveLength(2);
    expect(strategies[0]).toBeInstanceOf(LandUseFootprintForProductionStrategy);
    expect(strategies[1]).toBeInstanceOf(WaterUseStrategy);
  });
});
