import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';

import { apiRawService } from 'services/api';
import { AnalysisState } from 'store/features/analysis';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

type YearsData = number[];
type YearsResponse = UseQueryResult<YearsData>;

export function useYears(
  layer: AnalysisState['layer'],
  materials: AnalysisState['filters']['materials'],
  indicator: AnalysisState['filters']['indicator'],
): YearsResponse {
  // const [session] = useSession();

  const result = useQuery(
    ['years', layer, materials, indicator],
    async () =>
      apiRawService
        .request<YearsData>({
          method: 'GET',
          url: '/h3/years',
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
    DEFAULT_QUERY_OPTIONS,
  );

  return result as YearsResponse;
}
