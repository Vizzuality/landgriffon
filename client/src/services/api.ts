import axios from 'axios';
import Jsona from 'jsona';
import { getSession, signOut } from 'next-auth/react';

/**
 * API service require to be authenticated.
 * Then, by default all the request are sending the authorization header.
 */

const dataFormatter = new Jsona();

const defaultConfig = {
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
};

const authorizedRequest = async (config) => {
  const session = await getSession();

  config.headers['Authorization'] = `Bearer ${session?.accessToken}`;
  return config;
};

const onResponseError = (error) => {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  if (error.response.status === 401) {
    signOut();
  }
  // Do something with response error
  return Promise.reject(error);
};

// This endpoint by default will deserialize the data
export const apiService = axios.create(defaultConfig);

apiService.interceptors.response.use(
  (response) => ({
    ...response,
    data: {
      ...response.data,
      data: !!response.data && dataFormatter.deserialize(response.data), // JSON API deserialize
    },
  }),
  onResponseError,
);

apiService.interceptors.request.use(authorizedRequest, onResponseError);

// Use this endpoint when JSON API spec is not needed
// or the response doesn't follow this format
export const apiRawService = axios.create(defaultConfig);

apiRawService.interceptors.response.use((response) => response, onResponseError);
apiRawService.interceptors.request.use(authorizedRequest, onResponseError);

export default apiService;
