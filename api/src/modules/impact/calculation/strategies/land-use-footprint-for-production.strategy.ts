import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import { CalculationContext } from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';
import {
  H3GridSum,
  ImpactCalculationRepository,
} from 'modules/impact/calculation/impact-calculation.repository';
import {
  IndicatorCalculationStrategy,
  PreCalculationContext,
  PreCalculationResult,
} from 'modules/impact/calculation/strategies/indicator-calculation.strategy.interface';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';

export class LandUseFootprintForProductionStrategy extends IndicatorCalculationStrategy {
  indicatorCode: INDICATOR_NAME_CODES = INDICATOR_NAME_CODES.LF;
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

    const geoRegionH3IndexList =
      await this.calculationRepository.getGeoRegionH3IndexList({
        geoRegionId,
      });
    const productionH3DataSource =
      await this.calculationRepository.getMaterialH3DataSource(
        materialId,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );
    const harvestH3DataSource =
      await this.calculationRepository.getMaterialH3DataSource(
        materialId,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );

    const production = await this.calculationRepository.sumH3GridOverGeoRegion({
      geoRegionH3IndexList,
      materialH3DataSource: productionH3DataSource,
    });
    const harvest = await this.calculationRepository.sumH3GridOverGeoRegion({
      geoRegionH3IndexList,
      materialH3DataSource: harvestH3DataSource,
    });

    return {
      calculatedValues: {
        production,
        harvest,
      },
    };
  }

  /**
   * Calculates the final LF indicator value using the provided calculation context.
   * The calculation is based on:
   *   - landPerTon = harvest / production (if production > 0 and the result is finite)
   *   - LF = landPerTon * tonnage
   * @param context - Calculation context containing rawData and tonnage.
   * @returns The calculated LF value.
   */
  async calculate(context: CalculationContext): Promise<number> {
    const { tonnage, preCalculationValues } = context;
    const production = preCalculationValues.calculatedValues.production;
    const harvest: H3GridSum = preCalculationValues.calculatedValues.harvest;

    const landPerTon =
      production.value !== 0 &&
      Number.isFinite(harvest.value / production.value)
        ? harvest.value / production.value
        : 0;

    return landPerTon * tonnage;
  }
}
