import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { apiRawService } from 'services/api';
import type { AnalysisState } from 'store/features/analysis';

const DEFAULT_QUERY_OPTIONS = {
  placeholderData: [],
  retry: false,
  keepPreviousData: false,
  refetchOnWindowFocus: false,
};

type YearsData = number[];

export const useYears = <T = YearsData>(
  layer: AnalysisState['analysis/filters']['layer'],
  materials: AnalysisState['analysis/filters']['materials'],
  indicator: AnalysisState['analysis/filters']['indicator'],
  options: UseQueryOptions<YearsData, unknown, T> = {},
) => {
  const enabled = (options.enabled ?? true) && !!indicator;

  const query = useQuery(
    ['years', layer, materials, indicator],
    () =>
      apiRawService
        .request<{ data: YearsData }>({
          method: 'GET',
          url: '/h3/years',
          params: {
            layer,
            ...(materials && materials.length
              ? { materialIds: materials.map((material) => material.value) }
              : {}),
            ...(indicator && indicator.value && indicator.value !== 'all'
              ? { indicatorId: indicator.value }
              : {}),
          },
        })
        .then((response) => response.data.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
      enabled,
    },
  );

  return query;
};
