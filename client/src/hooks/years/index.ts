import type { UseQueryResult, UseQueryOptions } from 'react-query';
import { useQuery } from 'react-query';

import { apiRawService } from 'services/api';
import type { AnalysisState } from 'store/features/analysis';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: false,
  refetchOnWindowFocus: false,
};

type YearsData = number[];
type YearsResponse = UseQueryResult<YearsData>;

export function useYears(
  layer: AnalysisState['analysis/filters']['layer'],
  materials: AnalysisState['analysis/filters']['materials'],
  indicator: AnalysisState['analysis/filters']['indicator'],
): YearsResponse {
  const result = useQuery(
    ['years', layer, materials, indicator],
    async () =>
      apiRawService
        .request<YearsData>({
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
          transformResponse: (response) => {
            try {
              const parsedData = JSON.parse(response);
              return parsedData.data;
            } catch (error) {
              return response;
            }
          },
        })
        .then((response) => response.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: !!indicator,
    },
  );

  return result as YearsResponse;
}
