import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiService } from 'services/api';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { Profile, UserPayload } from 'types';

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

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }: { id: string; data: Profile }) =>
      apiService.request({
        method: 'PATCH',
        url: `/users/${id}`,
        data,
      }),
    {
      onSuccess: () => queryClient.invalidateQueries(['users']),
    },
  );
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: Profile) =>
      apiService.request({
        method: 'POST',
        url: '/users',
        data: { ...data, password: '123qweasd' },
      }),
    {
      onSuccess: () => queryClient.invalidateQueries(['users']),
    },
  );
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (id: string) =>
      apiService.request({
        method: 'Delete',
        url: `users/${id}`,
      }),
    {
      onSuccess: () => queryClient.invalidateQueries(['users']),
    },
  );
};
