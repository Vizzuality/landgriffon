import type { AxiosPromise } from 'axios';
import { useMemo } from 'react';
import type { UseQueryResult, UseQueryOptions } from 'react-query';
import { useQuery, useQueryClient, useMutation } from 'react-query';

import { apiService } from 'services/api';

import type { ProfilePayload, PasswordPayload, ErrorResponse } from 'types';

type ResponseData = UseQueryResult<ProfilePayload>;

const DEFAULT_QUERY_OPTIONS: UseQueryOptions<ProfilePayload> = {
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

export function useProfile(): ResponseData {
  const fetchProfile = useQuery(
    'profile',
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/users/me',
        })
        .then((response) => {
          if (response.status === 200) return response.data.data;
          return response;
        }),
    DEFAULT_QUERY_OPTIONS,
  );

  return useMemo<ResponseData>((): ResponseData => fetchProfile, [fetchProfile]);
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  const patchProfile = (data: ProfilePayload): AxiosPromise =>
    apiService
      .request({
        method: 'PATCH',
        data,
        url: '/users/me',
      })
      .then((response) => {
        if (response.status === 200) return response.data.data;
        return response;
      });

  return useMutation<unknown, ErrorResponse, ProfilePayload>(patchProfile, {
    mutationKey: 'update-profile',
    onSuccess: () => queryClient.invalidateQueries('profile'),
  });
}

export function useUpdatePassword() {
  const patchPassword = (data): AxiosPromise =>
    apiService
      .request({
        method: 'PATCH',
        data,
        url: '/users/me/password',
      })
      .then((response) => {
        if (response.status === 200) return response.data.data;
        return response;
      });

  return useMutation<unknown, ErrorResponse, PasswordPayload>(patchPassword, {
    mutationKey: 'update-password',
  });
}
