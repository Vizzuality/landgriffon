import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';

import apiService from 'services/api';
import { AnalysisState } from 'store/features/analysis';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

type YearResponse = UseQueryResult<number[]>;

export function useYears(
  layer: AnalysisState['layer'],
  materials: AnalysisState['filters']['materials'],
  indicator: AnalysisState['filters']['indicator'],
): YearResponse {
  // const [session] = useSession();

  const result = useQuery(
    ['years', layer, materials, indicator],
    async () =>
      apiService
        .request<number[]>({
          method: 'GET',
          url: '/years',
          headers: {
            // Authorization: `Bearer ${session.accessToken}`,
          },
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
        .then((response) => response.data),
    DEFAULT_QUERY_OPTIONS,
  );

  return result as YearResponse;
}
