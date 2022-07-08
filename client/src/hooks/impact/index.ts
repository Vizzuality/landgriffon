import { useMemo } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';

import chroma from 'chroma-js';

import { useAppSelector } from 'store/hooks';
import { filtersForTabularAPI } from 'store/features/analysis/selector';
import { analysisFilters } from 'store/features/analysis/filters';
import { scenarios } from 'store/features/analysis/scenarios';

import { apiRawService } from 'services/api';
import { useIndicators } from 'hooks/indicators';

import type { RGBColor, ImpactData, ImpactRanking, APIpaginationRequest } from 'types';
import { useStore } from 'react-redux';

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
const COLOR_SCALE = chroma.scale(['#8DD3C7', '#BEBADA', '#FDB462']);

export function useColors(): RGBColor[] {
  const { layer } = useAppSelector(analysisFilters);
  const colors = useMemo(() => COLOR_SCALE[layer].map((color) => chroma(color).rgb()), [layer]);
  return colors;
}

type ImpactDataResponse = UseQueryResult<ImpactData, unknown>;
type ImpactRankingResponse = UseQueryResult<ImpactRanking, unknown>;

export const useImpactData: (pagination?: APIpaginationRequest) => ImpactDataResponse = (
  pagination,
) => {
  const store = useStore();
  const { data: indicators } = useIndicators();
  const { layer } = useAppSelector(analysisFilters);
  const { isComparisonEnabled, scenarioToCompare } = useAppSelector(scenarios);
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
    ...(isComparisonEnabled ? { scenarioId: scenarioToCompare } : {}),
    ...restFilters,
    ...pagination,
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
  const store = useStore();
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
