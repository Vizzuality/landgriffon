import { useQuery } from '@tanstack/react-query';

import { apiService } from 'services/api';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { Indicator, PaginationMetadata } from 'types';

const DEFAULT_QUERY_OPTIONS = {
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

type ResponseData = { data: Indicator[]; meta: PaginationMetadata };

export const useIndicators = <T = ResponseData>(
  queryParams: Record<string, unknown> = {},
  options: UseQueryOptions<ResponseData, unknown, T, ['indicators']> = {},
) => {
  const query = useQuery(
    ['indicators', queryParams],
    () =>
      apiService
        .request<ResponseData>({
          method: 'GET',
          url: '/indicators',
          params: queryParams,
        })
        .then(({ data }) => data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      placeholderData: { data: [], meta: {} },
      ...options,
    },
  );

  return query;
};

export const useIndicator = <T = Indicator>(
  id: Indicator['id'],
  options?: UseQueryOptions<Indicator, unknown, T, ['indicators', typeof id]>,
) => {
  const enabled = (options?.enabled ?? true) && !!id && id !== 'all';
  const query = useQuery(
    ['indicators', id],
    () =>
      apiService
        .request<{ data: Indicator }>({
          method: 'GET',
          url: `/indicators/${id}`,
          params: { include: 'unit' },
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
      enabled,
    },
  );

  return query;
};
