import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import {
  AdminRegionId,
  DistributedImpactValue,
  GeoRegionId,
  H3GridSum,
  ImpactCalculationRepository,
  MaterialId,
  TotalWeightedImpact,
} from 'modules/impact/calculation/impact-calculation.repository';

export interface PreCalculationContext {
  geoRegionId: GeoRegionId;
  materialId: MaterialId;
  adminRegionId: AdminRegionId;
}

// Almost all strategies will use a production value and a rawBaseValue,
// but some strategies might need some other one-off values (like WGSWU_NEW)
export type PreCalculationResult = {
  calculatedValues: {
    [key: string]: DistributedImpactValue | TotalWeightedImpact | H3GridSum;
  };
};

export interface CalculationContext {
  tonnage: number;
  preCalculationValues: PreCalculationResult;
  calculatedImpacts: Map<INDICATOR_NAME_CODES, number>;
}

/**
 * Interface that all indicator calculation strategies must implement.
 * Each strategy encapsulates:
 *   1. The query or queries needed to obtain the raw value of the indicator from the database.
 *   2. The formula to calculate the final indicator value using the provided calculation context.
 */
export abstract class IndicatorCalculationStrategy {
  /**
   * Unique indicator code that identifies the strategy.
   */
  indicatorCode: INDICATOR_NAME_CODES;

  // Priority is used to determine the order of execution for the strategies. Strategies with no dependencies, will have
  // lower priority,which will be executed first (e.g. LF). While strategies with dependencies will have higher priority.
  public abstract readonly executionPriority: number;

  constructor(
    public readonly indicator: Indicator,
    protected readonly calculationRepository: ImpactCalculationRepository,
  ) {}

  /**
   * Fetches all the necessary data to calculate the values that will be used in the final calculation of the indicator.
   * (geoRegion's H3 index list, H3 Data sources, calculating rawValues, etc.)
   * @param context
   */
  abstract preCalculate(
    context: PreCalculationContext,
  ): Promise<PreCalculationResult>;

  /**
   * Calculates the final value of the indicator using the provided calculation context (which includes
   * values calculated in the preCalculate method, as well as final impact values of other indicators that
   * were calculated first).
   * @param context - Context containing the raw data, tonnage, and other pre-calculated values needed.
   * @returns The final value of the indicator.
   */
  abstract calculate(context: CalculationContext): Promise<number>;
}
