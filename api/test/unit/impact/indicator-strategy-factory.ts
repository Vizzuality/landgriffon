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

describe('IndicatorStrategyFactory', () => {
  let strategyFactory: IndicatorStrategyFactory;

  beforeEach(() => {
    strategyFactory = new IndicatorStrategyFactory();
  });

  test('should generate strategies based on active indicators', () => {
    const activeIndicators = [
      { nameCode: INDICATOR_NAME_CODES.LF },
      { nameCode: INDICATOR_NAME_CODES.DF_SLUC },
      { nameCode: INDICATOR_NAME_CODES.GHG_DEF_SLUC },
      { nameCode: INDICATOR_NAME_CODES.UWU },
    ] as Indicator[];

    const strategies = strategyFactory.getStrategies(
      activeIndicators.map((i: Indicator) => i.nameCode),
    );

    expect(strategies).toHaveLength(4);
    expect(strategies[0]).toBeInstanceOf(LandUseFootprintForProductionStrategy);
    expect(strategies[1]).toBeInstanceOf(DeforestationFootprintStrategy);
    expect(strategies[2]).toBeInstanceOf(GHGDeforestationStrategy);
    expect(strategies[3]).toBeInstanceOf(UnsustainableWaterUseStrategy);
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
