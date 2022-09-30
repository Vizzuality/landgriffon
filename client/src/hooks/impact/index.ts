import { useQuery } from '@tanstack/react-query';

import { apiRawService } from 'services/api';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { ImpactData } from 'types';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions<ImpactData> = {
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

export const useImpactData = (
  params: Record<string, unknown> = {},
  options: UseQueryOptions<ImpactData> = {},
) => {
  const query = useQuery<ImpactData>(
    ['impact-data', params],
    () => apiRawService.get('/impact/table', { params }).then((response) => response.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
    },
  );

  return query;
};
