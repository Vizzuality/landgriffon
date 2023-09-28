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

@Injectable()
export class IndicatorQueryDependencyManager {
  queryMap: typeof INDICATOR_NAME_CODE_TO_QUERY_MAP =
    INDICATOR_NAME_CODE_TO_QUERY_MAP;

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
    return {
      params: [...new Set(params)]
        .map((param: string) => `"${param}"`)
        .join(', '),
      query: paramsToQueryInjector(
        importQueryFields,
        [...new Set(queries)].join(', '),
      ),
    };
  }
}
