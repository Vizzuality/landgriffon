import { Injectable } from '@nestjs/common';
import { INDICATOR_NAME_CODES } from '../../indicators/indicator.entity';
import { IIndicatorCalculationStrategy } from './strategies/indicator-calculation.strategy.interface';

/**
 * Represents a SQL fragment along with its alias.
 * Each fragment should use tokens (e.g. {{geoRegionId}}, {{materialId}}, etc.)
 * instead of hard-coded parameters.
 */
export interface ImpactQueryFragment {
  fragment: string;
  alias: string;
}

/**
 * ImpactQueryBuilder assembles the dynamic query fragments from the active indicator strategies.
 * It injects the proper query parameters based on a single mapping, guaranteeing that each key always
 * references the correct parameter number.
 */
@Injectable()
export class ImpactQueryBuilderV2 {
  /**
   * Mapping of parameter names to their respective placeholder numbers.
   * This single source of truth ensures consistency.
   */

  // TODO: due to how the query is run right now, we need to inject the table and column names as strings, but this will potentially change in the future
  private paramMapping: Record<string, string> = {
    $1: 'sourcing_location."geoRegionId"',
    $2: 'sourcing_location."adminRegionId"',
    $3: 'sourcing_location."materialId"',
  };

  /**
   * Injects the correct parameter placeholders into the given query.
   * Each token (e.g. {{geoRegionId}}) will be replaced by the corresponding parameter number ($1, $2, etc.).
   *
   * @param query - SQL fragment with tokens to be replaced.
   * @returns Updated query with parameter placeholders.
   */
  private injectQueryParameters(query: string): string {
    let updatedQuery = query;
    for (const placeholder in this.paramMapping) {
      updatedQuery = updatedQuery
        .split(placeholder)
        .join(this.paramMapping[placeholder]);
    }
    return updatedQuery;
  }

  getSelectFields(indicatorNameCodes: INDICATOR_NAME_CODES[]): string {
    return indicatorNameCodes.join(', ');
  }

  /**
   * Builds the final query and alias list by:
   *   1. Collecting all query fragments from the given strategies.
   *   2. Replacing their tokens with the correct parameter placeholders.
   *   3. Deduplicating fragments by alias.
   *
   * @param strategies - Array of active strategies (each with getRawQueries() returning ImpactQueryFragment[]).
   * @returns An object containing:
   *    - query: a string with all deduplicated SQL fragments separated by commas.
   *    - aliases: a string with all deduplicated column aliases (wrapped in quotes) separated by commas.
   */
  buildQuery(strategies: IIndicatorCalculationStrategy[]): string {
    // 1. Collect all queries for each strategy needed to be executed.
    const allQueries: string[] = strategies.flatMap((strategy) =>
      strategy.getRawQueries(),
    );

    // 2. Generate a unique list of queries to remove redundancies. i.e: if two different strategies depend on the same indicator, we would have a repeating query
    const uniqueQueries = [...new Set(allQueries)].join(', ');

    // 3. Get the fields to add to the select statement
    //    LF is computed internally, so it should not be included as selectable field. If we go to the batch approach, we could change this
    //    as it's a corner case that breaks the pattern
    const selectFields = this.getSelectFields(
      strategies
        .map((s) => s.indicatorCode)
        .filter((code) => code !== INDICATOR_NAME_CODES.LF),
    );
    // 4. Inject the query parameters into the unique queries
    const query = this.injectQueryParameters(uniqueQueries);

    // 5. Return the final query to be executed
    return this.addDynamicParamsToQuery(selectFields, query);
  }

  // TODO: Following the plan to offload the impact calculation to a DB table and batch processing instead of doing it all at once and in memory,
  //       this method and the way keys are injected will change:
  //       i.e: If we decide to run it by location, query parameters will change to be UUIDs instead of table/column names.
  private addDynamicParamsToQuery(
    selectFields: string,
    impactQueries: string,
  ): string {
    return `
      SELECT DISTINCT ON (sr.id)
        sr.id as "sourcingRecordId",
        sr.tonnage,
        sr.year,
        slwithmaterialh3data.id as "sourcingLocationId",
        slwithmaterialh3data."materialH3DataId",
        ${selectFields}
      FROM sourcing_records sr
      INNER JOIN (
        SELECT
          sourcing_location.id,
          "scenarioInterventionId",
          "interventionType",
          mth."h3DataId" as "materialH3DataId",
          ${impactQueries}
        FROM sourcing_location
        INNER JOIN material_to_h3 mth
          ON mth."materialId" = sourcing_location."materialId"
        WHERE "scenarioInterventionId" IS NULL
          AND "interventionType" IS NULL
          AND mth."type" = 'producer'
      ) as slwithmaterialh3data
      ON sr."sourcingLocationId" = slwithmaterialh3data.id;
    ;
    `;
  }
}
