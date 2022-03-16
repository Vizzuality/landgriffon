import { AxiosError, AxiosPromise } from 'axios';
import { useMemo } from 'react';
import {
  useQuery,
  useQueryClient,
  UseQueryResult,
  UseQueryOptions,
  useMutation,
} from 'react-query';

import { apiService } from 'services/api';

type ProfilePayload = {
  fname?: string;
  lname?: string;
  email: string;
};

type PasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

type ResponseData = UseQueryResult<ProfilePayload>;

type ErrorResponse = AxiosError<{
  errors: {
    status: string;
    title: string;
  }[];
}>;

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

  const patchProfile = ({ data }): AxiosPromise =>
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

  return useMutation<unknown, ErrorResponse, { data: ProfilePayload }>(patchProfile, {
    mutationKey: 'update-profile',
    onSuccess: () => queryClient.invalidateQueries('profile'),
  });
}

export function useUpdatePassword() {
  const patchPassword = ({ data }): AxiosPromise =>
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

  return useMutation<unknown, ErrorResponse, { data: PasswordPayload }>(patchPassword, {
    mutationKey: 'update-password',
  });
}
