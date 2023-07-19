import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiService } from 'services/api';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { ProfilePayload, UserPayload } from 'types';

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

export const useDeleteUser = () => {
  const deleteUser = (id: string) =>
    apiService.request({
      method: 'DELETE',
      url: `/users/${id}`,
    });

  const queryClient = useQueryClient();

  return useMutation(deleteUser, {
    mutationKey: ['delete-user'],
    onSuccess: () => queryClient.invalidateQueries(['users']),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: Omit<ProfilePayload, 'id'>) =>
      apiService.request({
        method: 'POST',
        url: '/users/',
        data,
      }),
    {
      mutationKey: ['create-user'],
      onSuccess: () => queryClient.invalidateQueries(['users']),
    },
  );
};

export const useEditUser = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, ...data }: Omit<ProfilePayload, 'email'>) =>
      apiService.request({
        method: 'PATCH',
        url: `/users/${id}`,
        data,
      }),
    {
      mutationKey: ['edit-user'],
      onSuccess: () => queryClient.invalidateQueries(['users']),
    },
  );
};
