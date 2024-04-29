import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { apiRawServiceWithoutAuth, apiService } from 'services/api';
import { authService } from 'services/authentication';

import type { User, PasswordPayload, ErrorResponse, ProfilePayload } from 'types';
import type { AxiosPromise } from 'axios';

export function useProfile() {
  const { data: session } = useSession();

  return useQuery(['profile', session.accessToken], () =>
    apiService
      .request<{
        data: User & {
          id: string;
          type: 'users';
        };
      }>({
        method: 'GET',
        url: '/users/me',
      })
      .then(({ data }) => data?.data),
  );
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

export const useActivateAccount = () => {
  const activateAccount = ({ password, token }: ResetPasswordPayload): Promise<User> =>
    authService
      .request({
        method: 'POST',
        url: '/validate-account',
        headers: { Authorization: `Bearer ${token}` },
        data: { password },
      })
      .then((response) => response.data?.data?.attributes);

  return useMutation<unknown, ErrorResponse, ResetPasswordPayload>(activateAccount, {
    mutationKey: ['activate-account'],
  });
};
