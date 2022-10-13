import { useQuery } from '@tanstack/react-query';

import { apiRawService } from 'services/api';

import type { Indicator, Material } from 'types';
import type { AnalysisState } from 'store/features/analysis';
import type { UseQueryOptions } from '@tanstack/react-query';

const DEFAULT_QUERY_OPTIONS = {
  placeholderData: [],
  retry: false,
  keepPreviousData: false,
  refetchOnWindowFocus: false,
};

type YearsData = number[];

export const useYears = <T = YearsData>(
  layer: AnalysisState['analysis/filters']['layer'],
  materialIds: Material['id'][],
  indicatorId: Indicator['id'],
  options: UseQueryOptions<YearsData, unknown, T> = {},
) => {
  const enabled = (options.enabled ?? true) && !!indicatorId;

  const query = useQuery(
    ['years', layer, materialIds, indicatorId],
    () =>
      apiRawService
        .request<{ data: YearsData }>({
          method: 'GET',
          url: '/h3/years',
          params: {
            layer,
            materialIds,
            indicatorId: indicatorId === 'all' ? undefined : indicatorId,
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
