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

const DEFAULT_QUERY_RANKING_OPTIONS: UseQueryOptions = {
  placeholderData: {
    impactTable: [],
    purchasedTonnes: [],
  },
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

type ImpactDataResponse = UseQueryResult<ImpactData, unknown>;
type ImpactRankingResponse = UseQueryResult<ImpactRanking, unknown>;

export const useImpactData: (pagination?: APIpaginationRequest) => ImpactDataResponse = (
  pagination,
) => {
  const store = useStore() as Store;
  const { data: indicators } = useIndicators();
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
    async () => apiRawService.get('/impact/table', { params }).then((response) => response.data),
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

export function useImpactRanking(
  params = { maxRankingEntities: 5, sort: 'ASC' },
): ImpactRankingResponse {
  const store = useStore() as Store;
  const { data: indicators } = useIndicators();
  const { layer } = useAppSelector(analysisFilters);
  const filters = filtersForTabularAPI(store.getState());

  const isEnable =
    !!filters?.indicatorId &&
    !!indicators?.length &&
    !!filters.startYear &&
    !!filters.endYear &&
    filters.endYear !== filters.startYear;

  const indicatorIds = indicators.map(({ id }) => id);

  const query = useQuery(
    ['impact-ranking', layer, indicatorIds, filters, params],
    async () =>
      apiRawService
        .get('/impact/ranking', {
          params: {
            indicatorIds: filters.indicatorId === 'all' ? indicatorIds : [filters.indicatorId],
            startYear: filters.startYear,
            endYear: filters.endYear,
            groupBy: filters.groupBy,
            ...filters,
            ...params,
          },
        })
        .then((response) => {
          return response.data;
        }),
    {
      ...DEFAULT_QUERY_RANKING_OPTIONS,
      enabled: layer === 'impact' && isEnable,
    },
  );

  const { data, isError } = query;

  return useMemo<ImpactRankingResponse>(
    () =>
      ({
        ...query,
        data: (isError ? DEFAULT_QUERY_RANKING_OPTIONS.placeholderData : data) as ImpactData,
      } as ImpactRankingResponse),
    [query, isError, data],
  );
}
