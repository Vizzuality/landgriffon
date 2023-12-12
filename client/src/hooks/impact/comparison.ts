import { useQuery } from '@tanstack/react-query';

import { apiRawService } from 'services/api';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { Scenario } from 'containers/scenarios/types';
import type { ImpactDataApiResponse } from './types';

const DEFAULT_QUERY_OPTIONS = {
  placeholderData: {
    data: {
      impactTable: [],
      purchasedTonnes: [],
    },
    metadata: {
      page: 1,
      size: 1,
      totalItems: 1,
      totalPages: 1,
    },
  },
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

export type ImpactComparisonParams = {
  scenarioId?: Scenario['id']; // TO-DO: remove and unify with comparedScenarioId
  baseScenarioId?: Scenario['id'];
  comparedScenarioId: Scenario['id'];
  indicatorIds: string[];
  groupBy: string;
  startYear: number;
  endYear: number;
  materialIds?: string[];
  businessUnitIds?: string[];
  originIds?: string[];
  supplierIds?: string[];
  locationTypes?: string[];
  disabledPagination: boolean;
};

export const useImpactComparison = <T = ImpactDataApiResponse<true>>(
  params: Partial<ImpactComparisonParams>,
  options: UseQueryOptions<
    ImpactDataApiResponse<true>,
    unknown,
    T,
    ['impact-comparison', typeof params]
  > = {},
) => {
  const isScenarioVsScenario = params.baseScenarioId && params.comparedScenarioId;
  const URL = isScenarioVsScenario
    ? '/impact/compare/scenario/vs/scenario'
    : '/impact/compare/scenario/vs/actual';

  const query = useQuery(
    ['impact-comparison', params],
    () =>
      apiRawService
        // TO-DO: add ImpactDataApiResponse<true> once the API unify the params
        .get(URL, {
          params: params,
        })
        .then((response) => {
          const result = response.data;
          result.data.impactTable =
            result.data.impactTable || result.data.scenarioVsScenarioImpactTable;
          return result;
        }),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
    },
  );

  return query;
};

export const useImpactScenarioComparison = <T = ImpactDataApiResponse<true>>(
  params: Partial<ImpactComparisonParams>,
  options: UseQueryOptions<
    ImpactDataApiResponse<true>,
    unknown,
    T,
    ['impact-scenario-vs-scenario', typeof params]
  > = {},
) => {
  const enabled =
    (options.enabled ?? true) && !!params.baseScenarioId && !!params.comparedScenarioId;

  const query = useQuery(
    ['impact-scenario-comparison', params],
    () =>
      apiRawService
        .get<ImpactDataApiResponse<true>>('/impact/compare/scenario/vs/scenario', {
          params,
        })
        .then((response) => response.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      placeholderData: {
        data: {
          impactTable: [],
          purchasedTonnes: [],
        },
        metadata: {},
      },
      ...options,
      enabled,
    },
  );

  return query;
};
