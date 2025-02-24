import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { ImpactQueryExpression } from 'modules/indicator-records/services/impact-calculation.dependencies';
import { SourcingRecordsWithIndicatorRawData } from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';

/**
 * Calculation context that will be passed to each strategy.
 * It includes raw data from the database, tonnage, and pre-calculated values such as production and landPerTon.
 */
export interface CalculationContext {
  rawData: SourcingRecordsWithIndicatorRawData;
  tonnage: number;
  production: number; // Can be derived from rawData
  landPerTon: number; // Pre-calculated value, e.g., rawData.harvest / rawData.production TODO: We need a cleaner naming NOW!
  // TODO: Probably here is where we need to add the unweighted impact
}

/**
 * Interface that all indicator calculation strategies must implement.
 * Each strategy encapsulates:
 *   1. The query or queries needed to obtain the raw value of the indicator from the database.
 *   2. The formula to calculate the final indicator value using the provided calculation context.
 */
export interface IIndicatorCalculationStrategy {
  /**
   * Unique indicator code that identifies the strategy.
   */
  indicatorCode: INDICATOR_NAME_CODES;

  /**
   * Returns one or more query fragments (as strings) required to obtain the raw value
   * of the indicator from the database.
   */
  getRawQueries(): ImpactQueryExpression[];

  /**
   * Calculates the final value of the indicator using the provided calculation context.
   * @param context - Context containing the raw data, tonnage, and other pre-calculated values needed.
   * @returns The final value of the indicator.
   */
  calculate(context: CalculationContext): number;
}
