import { Injectable } from '@nestjs/common';
import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { paramsToQueryInjector } from 'utils/helpers/params-to-query-injector.helper';
import {
  INDICATOR_NAME_CODE_TO_QUERY_MAP,
  ImpactQueryPropertyName,
  ImpactQueryExpression,
  ImpactPropertyToQueryFunction,
} from 'modules/indicator-records/services/impact-calculation.dependencies';

type IndicatorNameCodeToQuery = {
  [key in ImpactQueryPropertyName]?: ImpactPropertyToQueryFunction;
};

/**
 * @description: Dynamically builds the query for calculating the raw impact values. Based on which indicators are activated in the platform,
 * it gets all dependencies for each indicator, defined in the queryMap, and builds the stringified query that then will injected withint the main query.
 */

@Injectable()
export class ImpactQueryBuilder {
  queryMap: typeof INDICATOR_NAME_CODE_TO_QUERY_MAP =
    INDICATOR_NAME_CODE_TO_QUERY_MAP;

  /**
   * @description: Builds the query for the intervention impact calculation
   */

  buildQueryForIntervention(nameCodes: INDICATOR_NAME_CODES[]): string {
    const queries: ImpactQueryExpression[] = [];
    for (const nameCode of nameCodes) {
      const queryObject: IndicatorNameCodeToQuery = this.queryMap[nameCode];
      for (const queryFunction of Object.values(queryObject)) {
        const querySegment: ImpactQueryExpression = queryFunction();
        queries.push(querySegment);
      }
    }
    return [...new Set(queries)].join(', ');
  }

  /**
   * @description: Builds the query for the import impact calculation. Since for the main query whole columns will be used instead of specific value:
   * i.e: All geoRegion and material Ids from sourcing locations, instead of specific Ids, we need to quote wrap the table plus column names so that can be
   * injected into the main query.
   *
   * @returns: Object with the params and query string that will be injected into the main query.
   */

  buildQueryForImport(nameCodes: INDICATOR_NAME_CODES[]): {
    params: string;
    query: string;
  } {
    const importQueryFields: string[] = [
      `sourcing_location."geoRegionId"`,
      `sourcing_location."materialId"`,
      `sourcing_location."adminRegionId"`,
    ];
    const queries: ImpactQueryExpression[] = [];
    const params: string[] = [];

    for (const nameCode of nameCodes) {
      params.push(...Object.keys(this.queryMap[nameCode]));
      for (const nameCode of nameCodes) {
        const queryObject: IndicatorNameCodeToQuery = this.queryMap[nameCode];
        for (const queryFunction of Object.values(queryObject)) {
          const querySegment: ImpactQueryExpression = queryFunction();
          queries.push(querySegment);
        }
      }
    }

    const builtParams = this.buildParams(params);

    const queryWithInjectedParams = paramsToQueryInjector(
      importQueryFields,
      [...new Set(queries)].join(', '),
    );
    return {
      params: builtParams,
      query: queryWithInjectedParams,
    };
  }

  /**
   * @todo: since the implementation of the new indicator breaks out our current pattern and there is no time to have it thought through, we can leave it as is for now.
   *        refactoring to compute by location with no stored procedures should solve most of our problems.
   *@description: Builds a string of unique params for the highest level select statement and conditionally overrides parameters so that highest level select can get the data from the subquery, for when raw data for a indicator now it does not
   *              depend on a single query, but on multiple queries, meaning that we cannot use the nameCode as select param anymore in these cases
   */
  buildParams(paramList: string[]): string {
    const uniqueParams = [...new Set(paramList)];
    return uniqueParams
      .flatMap((param: string) =>
        param === INDICATOR_NAME_CODES.WGSWU_NEW
          ? ['BWS_IN_STRESSED_AREAS', 'STRESSED_AREA_PORTION']
          : param,
      )
      .map((param: string) => `"${param}"`)
      .join(', ');
  }
}
