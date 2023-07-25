import { useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

import { apiService } from 'services/api';

import type { User, PasswordPayload, ErrorResponse, ProfilePayload } from 'types';
import type { UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import type { AxiosPromise } from 'axios';
import { RoleName } from 'hooks/permissions/enums';

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

export const useSendResetPasswordEmail = () => {
  const sendResetPasswordEmail = (email: string) =>
    Promise.resolve(
      setTimeout(() => {
        console.log({ email });
        return {
          status: 200,
          email,
        };
      }, 1000),
    );

  return useMutation<unknown, ErrorResponse, unknown>(sendResetPasswordEmail, {
    mutationKey: ['send-reset-password-email'],
  });
};

export const useResetPassword = () => {
  const resetPassword = async (password: string): Promise<User> =>
    await new Promise((resolve, reject) => {
      resolve({
        id: '1da9b20f-1172-4838-9e96-78d5febdfb1c',
        fname: 'Bárbara',
        lname: 'Chaves',
        email: 'barbara.chaves@vizzuality.com',
        avatarDataUrl: null,
        isActive: true,
        isDeleted: false,
        roles: [
          {
            name: RoleName.ADMIN,
            permissions: [],
          },
        ],
      });
    });

  return useMutation<User, ErrorResponse, string, unknown>(resetPassword, {
    mutationKey: ['reset-password'],
  });
};
