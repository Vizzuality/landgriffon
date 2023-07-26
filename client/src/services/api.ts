import axios from 'axios';
import Jsona from 'jsona';
import { getSession, signOut } from 'next-auth/react';
import toast from 'react-hot-toast';

import type { ApiError, ErrorResponse } from 'types';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * API service require to be authenticated.
 * Then, by default all the request are sending the authorization header.
 */

const dataFormatter = new Jsona();

const defaultConfig: AxiosRequestConfig = {
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
};

const authorizedRequest = async (config) => {
  const session = await getSession();
  config.headers['Authorization'] = `Bearer ${session?.accessToken}`;

  return config;
};

const onResponseError = async (error: unknown) => {
  if (axios.isAxiosError<ApiError>(error)) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response.status === 401) {
      await signOut();
    }
    // Do something with response error
    return Promise.reject(error);
  }
};

// This endpoint by default will deserialize the data
export const apiService = axios.create(defaultConfig);

const responseDeserializer = (response: AxiosResponse) => ({
  ...response,
  data: {
    ...response.data,
    data: !!response.data && dataFormatter.deserialize(response.data), // JSON API deserialize
  },
});

apiService.interceptors.response.use(responseDeserializer, onResponseError);

apiService.interceptors.request.use(authorizedRequest, onResponseError);

// Use this endpoint when JSON API spec is not needed
// or the response doesn't follow this format
export const apiRawService = axios.create(defaultConfig);

apiRawService.interceptors.response.use((response) => response, onResponseError);
apiRawService.interceptors.request.use(authorizedRequest, (error) => Promise.reject(error));

export const apiRawServiceWithoutAuth = axios.create(defaultConfig);
apiRawServiceWithoutAuth.interceptors.response.use(responseDeserializer, onResponseError);

export const handleResponseError = (error: ErrorResponse) => {
  const { errors } = error.response?.data || {};
  (errors || []).forEach(({ meta, title }) => {
    if (!!meta?.rawError?.response) {
      const { message } = meta.rawError.response;
      if (Array.isArray(message)) {
        message.forEach((message) => toast.error(message));
      } else {
        toast.error(message);
      }
    } else {
      toast.error(title);
    }
  });
};

export default apiService;
