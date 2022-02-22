import axios from 'axios';
import Jsona from 'jsona';
import { signOut } from 'next-auth/react';

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

apiService.interceptors.response.use(onResponseSuccess, onResponseError);

apiRawService.interceptors.response.use(onResponseSuccess, onResponseError);

export default apiService;
