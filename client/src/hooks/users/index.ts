import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { apiService } from 'services/api';

const DEFAULT_QUERY_OPTIONS = {
  placeholderData: [],
  retry: false,
  keepPreviousData: false,
  refetchOnWindowFocus: false,
};

type YearsData = number[];

export const useUsers = <T = YearsData>(
  params?: Record<string, unknown>,
  options?: UseQueryOptions<YearsData, unknown, T> = {},
) => {
  const query = useQuery(
    ['users', params],
    () =>
      apiService
        .request<{ data: YearsData }>({
          method: 'GET',
          url: '/users',
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
