import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { apiRawService } from 'services/api';

import type { ImpactData } from 'types';

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

type ImpactComparisonParams = ImpactTabularAPIParams & {
  scenarioId: string;
};

export const useImpactComparison = <T = ImpactData>(
  params: Partial<ImpactComparisonParams> = {},
  options: UseQueryOptions<ImpactData, unknown, T> = {},
) => {
  const query = useQuery(
    ['impact-ranking', params],
    () =>
      apiRawService
        .get<ImpactData>('/impact/compare/scenario/vs/actual', {
          params,
        })
        .then((response) => response.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
    },
  );

  return query;
};
