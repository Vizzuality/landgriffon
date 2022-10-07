import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { Scenario } from 'containers/scenarios/types';

import { apiRawService } from 'services/api';

import type { ImpactData, ScenarioVsScenarioTableComparisonData } from 'types';

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

export const useImpactComparison = <T = ImpactData>(
  params: Partial<ImpactComparisonParams<true>>,
  options: UseQueryOptions<ImpactData, unknown, T> = {},
) => {
  const query = useQuery(
    ['impact-ranking', params],
    () =>
      apiRawService
        .get<ImpactData>('/impact/compare/scenario/vs/actual', {
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

export const useImpactScenarioComparison = <T = ScenarioVsScenarioTableComparisonData>(
  params: Partial<ImpactComparisonParams<false>>,
  options: UseQueryOptions<ScenarioVsScenarioTableComparisonData, unknown, T> = {},
) => {
  const enabled =
    (options.enabled ?? true) && !!params.scenarioOneValue && !!params.scenarioTwoValue;

  const query = useQuery(
    ['impact-ranking', params],
    () =>
      apiRawService
        .get<ScenarioVsScenarioTableComparisonData>('/impact/compare/scenario/vs/scenario', {
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
      },
      ...options,
      enabled,
    },
  );

  return query;
};
