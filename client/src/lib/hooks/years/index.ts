import { useQuery } from 'react-query';

import yearsService from 'services/years';
import { AnalysisState } from 'store/features/analysis';

export function useYears(
  layer: AnalysisState['layer'],
  materials: AnalysisState['filters']['materials'],
  indicator: AnalysisState['filters']['indicator'],
) {
  // const [session] = useSession();

  const result = useQuery(
    ['years', layer, materials, indicator],
    async () =>
      yearsService
        .request<number[]>({
          method: 'GET',
          url: `/`,
          headers: {
            // Authorization: `Bearer ${session.accessToken}`,
          },
          params: {
            layer,
            materialId:
              materials.length > 0
                ? materials.map((material) => material.value).join(',')
                : undefined,
            indicatorId: indicator?.value ?? undefined,
          },
        })
        .then((response) => response.data),
    {
      keepPreviousData: true,
      placeholderData: [],
    },
  );

  return {
    ...result,
    data: result.data,
  };
}
