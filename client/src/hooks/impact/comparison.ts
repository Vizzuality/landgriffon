import { useQuery } from '@tanstack/react-query';

import { apiRawService } from 'services/api';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { Scenario } from 'containers/scenarios/types';
import type { ImpactDataApiResponse } from './types';
import type { ImpactTabularAPIParams } from 'types';

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

type ImpactComparisonParams<VsActual extends boolean> = Omit<ImpactTabularAPIParams, 'scenarioId'> &
  (VsActual extends true
    ? { scenarioId: Scenario['id'] }
    : {
        scenarioOneValue: Scenario['id'];
        scenarioTwoValue: Scenario['id'];
      });

export const useImpactComparison = <T = ImpactDataApiResponse<true>>(
  params: Partial<ImpactComparisonParams<true>>,
  options: UseQueryOptions<
    ImpactDataApiResponse<true>,
    unknown,
    T,
    ['impact-comparison', typeof params]
  > = {},
) => {
  const query = useQuery(
    ['impact-comparison', params],
    () =>
      apiRawService
        .get<ImpactDataApiResponse<true>>('/impact/compare/scenario/vs/actual', {
          params: params,
        })
        .then((response) => response.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
    },
  );

  return query;
};

export const useImpactScenarioComparison = <T = ImpactDataApiResponse<'scenario'>>(
  params: Partial<ImpactComparisonParams<false>>,
  options: UseQueryOptions<
    ImpactDataApiResponse<'scenario'>,
    unknown,
    T,
    ['impact-scenario-comparison', typeof params]
  > = {},
) => {
  const enabled =
    (options.enabled ?? true) && !!params.scenarioOneValue && !!params.scenarioTwoValue;

  const query = useQuery(
    ['impact-scenario-comparison', params],
    () =>
      apiRawService
        .get<ImpactDataApiResponse<'scenario'>>('/impact/compare/scenario/vs/scenario', {
          params: params,
        })
        .then((response) => response.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      placeholderData: {
        data: {
          scenarioVsScenarioImpactTable: [],
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
