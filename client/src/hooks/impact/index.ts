import { useMemo } from 'react';
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { useAppSelector } from 'store/hooks';
import { filtersForTabularAPI } from 'store/features/analysis/selector';
import { analysisFilters } from 'store/features/analysis/filters';
import { scenarios } from 'store/features/analysis/scenarios';

import { apiRawService } from 'services/api';
import { useIndicators } from 'hooks/indicators';

import type { ImpactData, ImpactRanking, APIpaginationRequest } from 'types';
import { useStore } from 'react-redux';

import type { ImpactTabularAPIParams } from 'types';
import type { Store } from 'store';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: {
    data: {
      impactTable: [],
      purchasedTonnes: [],
    },
    metadata: {
      unit: null,
    },
  },
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

const DEFAULT_QUERY_RANKING_OPTIONS: UseQueryOptions<ImpactRanking> = {
  placeholderData: {
    impactTable: [],
    purchasedTonnes: [],
  },
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

type ImpactDataResponse = UseQueryResult<ImpactData, unknown>;

export const useImpactData: (pagination?: APIpaginationRequest) => ImpactDataResponse = (
  pagination,
) => {
  const store = useStore() as Store;
  const { data: indicators } = useIndicators({ select: (data) => data.data });
  const { layer } = useAppSelector(analysisFilters);
  const { isComparisonEnabled, scenarioToCompare, currentScenario } = useAppSelector(scenarios);
  const filters = filtersForTabularAPI(store.getState());
  const { indicatorId, ...restFilters } = filters;

  const isEnable =
    !!indicatorId &&
    !!indicators?.length &&
    !!filters.startYear &&
    !!filters.endYear &&
    filters.endYear !== filters.startYear;

  const indicatorIds = useMemo(() => {
    if (indicatorId === 'all') {
      return indicators.map((indicator) => indicator.id);
    }
    if (indicatorId) return [indicatorId];
    return [];
  }, [indicators, indicatorId]);

  const params = {
    indicatorIds,
    startYear: filters.startYear,
    endYear: filters.endYear,
    groupBy: filters.groupBy,
    ...pagination,
    ...restFilters,
    ...pagination,
    ...(currentScenario && currentScenario !== 'actual-data'
      ? { scenarioId: currentScenario }
      : {}),
    ...(isComparisonEnabled && scenarioToCompare ? { scenarioId: scenarioToCompare } : {}),
  };

  const query = useQuery(
    ['impact-data', layer, params],
    () =>
      apiRawService
        .get('/impact/compare/scenario/vs/actual', { params })
        .then((response) => response.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: layer === 'impact' && isEnable,
    },
  );

  const { data, isError } = query;

  return useMemo<ImpactDataResponse>(
    () =>
      ({
        ...query,
        data: (isError ? DEFAULT_QUERY_OPTIONS.placeholderData : data) as ImpactData,
      } as ImpactDataResponse),
    [query, isError, data],
  );
};

type ImpactRankingParams = ImpactTabularAPIParams & {
  maxRankingEntities: number;
  sort: string;
};

export function useImpactRanking(
  params: Partial<ImpactRankingParams> = { maxRankingEntities: 5, sort: 'ASC' },
  options: UseQueryOptions<ImpactRanking> = {},
): UseQueryResult<ImpactRanking, unknown> {
  const query = useQuery<ImpactRanking>(
    ['impact-ranking', params],
    () =>
      apiRawService
        .get('/impact/ranking', {
          params,
        })
        .then((response) => {
          return response.data;
        }),
    {
      ...DEFAULT_QUERY_RANKING_OPTIONS,
      ...options,
    },
  );

  return query;
}
