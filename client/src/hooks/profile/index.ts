import { useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

import { apiService } from 'services/api';
import { RoleName } from 'hooks/permissions/enums';

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
  // const sendResetPasswordEmail = (data: RecoverPasswordPayload): Promise<User> =>
  //   apiService
  //     .request({
  //       method: 'POST',
  //       url: '/users/me/recover-password',
  //       data,
  //     })
  //     .then((response) => response.data?.data);
  const sendResetPasswordEmail = (data: RecoverPasswordPayload) =>
    Promise.resolve(
      setTimeout(() => {
        return {
          status: 200,
        };
      }, 1000),
    );

  return useMutation<unknown, ErrorResponse, RecoverPasswordPayload>(sendResetPasswordEmail, {
    mutationKey: ['send-reset-password-email'],
  });
};

type ResetPasswordPayload = {
  data: { password: string };
  token: string;
};

export const useResetPassword = () => {
  // const resetPassword = ({ data, token }: ResetPasswordPayload): Promise<User> =>
  //   apiService
  //     .request({
  //       method: 'POST',
  //       url: '/users/me/reset-password',
  //       data,
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .then((response) => response.data?.data);
  const resetPassword = ({ data, token }: ResetPasswordPayload): Promise<User> => {
    return Promise.resolve({
      email: 'barbara.chaves@vizzuality.com',
      id: '1',
      fname: 'User',
      lname: null,
      roles: [{ name: RoleName.USER, permissions: [] }],
      isActive: true,
      isDeleted: false,
    });
  };

  return useMutation<User, ErrorResponse, ResetPasswordPayload, unknown>(resetPassword, {
    mutationKey: ['reset-password'],
  });
};
