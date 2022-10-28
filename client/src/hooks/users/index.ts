import { useQuery } from '@tanstack/react-query';

import { apiService } from 'services/api';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { UserPayload } from 'types';

export const useUsers = (
  params: Record<string, unknown> = {},
  options: UseQueryOptions<UserPayload> = {},
) => {
  const queryOptions: UseQueryOptions<UserPayload> = {
    placeholderData: {
      data: [],
      meta: {
        pageNumber: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
      },
    },
    retry: false,
    keepPreviousData: false,
    refetchOnWindowFocus: false,
    ...options,
  };

  const query = useQuery<UserPayload>(
    ['users', params],
    () =>
      apiService
        .request({
          method: 'GET',
          url: '/users',
          params,
        })
        .then((response) => response.data),
    queryOptions,
  );

  return query;
};
