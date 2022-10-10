import { useQuery } from '@tanstack/react-query';

import { apiRawService } from 'services/api';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { APIpaginationRequest } from 'types';
import type { ImpactDataApiResponse } from './types';

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

interface UseImpactDataParams {
  indicatorIds: string[];
  startYear: number;
  endYear: number;
  groupBy?: string;
}

export const useImpactData = <T = ImpactDataApiResponse<false>>(
  params: UseImpactDataParams & APIpaginationRequest,
  options: UseQueryOptions<
    ImpactDataApiResponse<false>,
    unknown,
    T,
    ['impact-data', typeof params]
  > = {},
) => {
  const enabled =
    (options.enabled ?? true) &&
    !!params.indicatorIds.length &&
    !!params.startYear &&
    !!params.endYear &&
    params.endYear !== params.startYear;

  const query = useQuery(
    ['impact-data', params],
    () =>
      apiRawService
        .get<ImpactDataApiResponse<false>>('/impact/table', { params })
        .then((response) => response.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
      enabled,
    },
  );

  return query;
};
