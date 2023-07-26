import { useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

import { apiRawServiceWithoutAuth, apiService } from 'services/api';

import type { User, PasswordPayload, ErrorResponse, ProfilePayload } from 'types';
import type { UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import type { AxiosPromise } from 'axios';

type ResponseData = UseQueryResult<User>;

const DEFAULT_QUERY_OPTIONS: UseQueryOptions<User> = {
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

export function useProfile(): ResponseData {
  const fetchProfile = useQuery(
    ['profile'],
    () =>
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
    mutationKey: ['update-profile'],
    onSuccess: () => queryClient.invalidateQueries(['profile']),
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
    mutationKey: ['update-password'],
  });
}

type RecoverPasswordPayload = {
  email: string;
};

export const useSendResetPasswordEmail = () => {
  const sendResetPasswordEmail = (data: RecoverPasswordPayload): Promise<User> =>
    apiService
      .request({
        method: 'POST',
        url: '/users/me/password/recover',
        data,
      })
      .then((response) => response.data?.data);

  return useMutation<unknown, ErrorResponse, RecoverPasswordPayload>(sendResetPasswordEmail, {
    mutationKey: ['send-reset-password-email'],
  });
};

type ResetPasswordPayload = {
  password: string;
  token: string;
};

export const useResetPassword = () => {
  return useMutation<User, ErrorResponse, ResetPasswordPayload, unknown>(
    async ({ password, token }: ResetPasswordPayload): Promise<User> => {
      return await apiRawServiceWithoutAuth
        .request({
          method: 'POST',
          url: '/users/me/password/reset',
          data: { password },
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => response.data?.data);
    },
    {
      mutationKey: ['reset-password'],
    },
  );
};
