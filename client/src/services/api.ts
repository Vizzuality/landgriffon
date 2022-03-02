import axios from 'axios';
import Jsona from 'jsona';
import { getSession, signOut } from 'next-auth/react';

// TO-DO: refactor api service

const dataFormatter = new Jsona();

export const apiService = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  transformResponse: (response) => {
    try {
      const parsedData = JSON.parse(response);
      return dataFormatter.deserialize(parsedData);
    } catch (error) {
      return response;
    }
  },
});

export const apiWithMetadataService = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  transformResponse: (response) => {
    try {
      const parsedData = JSON.parse(response);
      return { data: dataFormatter.deserialize(parsedData), metadata: parsedData.meta };
    } catch (error) {
      return response;
    }
  },
});

export const apiRawService = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

const onResponseSuccess = (response) => response;

const onResponseError = (error) => {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  if (error.response.status === 401) {
    signOut();
  }
  // Do something with response error
  return Promise.reject(error);
};

const authorizedRequest = async (config) => {
  const { accessToken } = await getSession();
  config.headers['Authorization'] = `Bearer ${accessToken}`;
  return config;
};

apiService.interceptors.response.use(onResponseSuccess, onResponseError);
apiRawService.interceptors.response.use(onResponseSuccess, onResponseError);
apiWithMetadataService.interceptors.response.use(onResponseSuccess, onResponseError);

apiService.interceptors.request.use(authorizedRequest, onResponseError);
apiRawService.interceptors.request.use(authorizedRequest, onResponseError);
apiWithMetadataService.interceptors.request.use(authorizedRequest, onResponseError);

export default apiService;
