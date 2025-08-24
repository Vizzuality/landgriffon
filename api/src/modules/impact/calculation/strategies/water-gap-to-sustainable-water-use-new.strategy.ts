import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import {
  DistributedImpactValue,
  ImpactCalculationRepository,
} from 'modules/impact/calculation/impact-calculation.repository';
import {
  CalculationContext,
  IndicatorCalculationStrategy,
  PreCalculationContext,
  PreCalculationResult,
} from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';
import { AppConfig } from 'utils/app.config';

/**
 * WGUWUIndicatorStrategy implements the calculation for the WGUWU indicator.
 *
 * It defines:
 *   - Query dependencies: to fetch the raw WGUWU value via a stored procedure,
 *     the WW value (used to compute the water withdrawal),
 *     and the production value.
 *   - Arithmetic calculation:
 *       1. waterWithdrawalValue = raw WW value * tonnage.
 *       2. Final WGUWU = (raw WGUWU value * waterWithdrawalValue) / (100 * production),
 *          with safeguards against division by zero.
 */
export class WaterGapToSustainableWaterUseNewStrategy extends IndicatorCalculationStrategy {
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.WGSWU_NEW;
  executionPriority: number = 1; //depends on WW, set to 1 to execute later
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
    const { geoRegionId } = context;

    const indicatorH3DataSource =
      await this.calculationRepository.getIndicatorH3DataSource(
        this.indicatorCode,
      );

    // Get required arguments for calculations (h3 index, h3 data sources...)
    const geoRegionH3IndexList =
      await this.calculationRepository.getGeoRegionH3IndexList({
        geoRegionId,
      });

    // calculate the raw base value IF production > 0, otherwise calculate the distributed value is the app flag is set
    let bwsInStressedAreas: DistributedImpactValue = new DistributedImpactValue(
      0,
    );
    let stressedAreaPortion: DistributedImpactValue =
      new DistributedImpactValue(0);
    if (this.useDistributedImpact) {
      bwsInStressedAreas =
        await this.calculationRepository.getBWSInStressedAreasOverGeoregion({
          indicatorNameCode: this.indicatorCode,
          indicatorH3DataSource,
          geoRegionH3IndexList,
        });
      stressedAreaPortion =
        await this.calculationRepository.getStressedAreaPortionOverGeoregion({
          indicatorNameCode: this.indicatorCode,
          indicatorH3DataSource,
          geoRegionH3IndexList,
        });
    }

    return {
      calculatedValues: {
        bwsInStressedAreas,
        stressedAreaPortion,
      },
    };
  }

  /**
   * Calculates the final WGUWU_NEW indicator value using the provided calculation context.
   * The calculation is based on:
   *   - if bwsInStressedAreas <= 0.4, excessBws = 0.
   *   - otherwise excessBws = (bwsInStressedAreas - 0.4) / bwsInStressedAreas
   *   - Final WGUWU_NEW = excessBws * stressedAreaPortion * calculatedWW;
   *
   * @param context - Calculation context containing rawData, tonnage, production, etc.
   * @returns The calculated WGUWU value.
   */
  async calculate(context: CalculationContext): Promise<number> {
    const { calculatedImpacts, preCalculationValues } = context;
    const bwsInStressedAreas =
      preCalculationValues.calculatedValues.bwsInStressedAreas;
    const stressedAreaPortion =
      preCalculationValues.calculatedValues.stressedAreaPortion;

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

    // Compute final WGUWU value; guard against division by zero.
    const excessBws =
      bwsInStressedAreas.value > 0.4
        ? (bwsInStressedAreas.value - 0.4) / bwsInStressedAreas.value
        : 0;

    const result: number = excessBws * stressedAreaPortion.value * calculatedWW;

    return result;
  }
}
