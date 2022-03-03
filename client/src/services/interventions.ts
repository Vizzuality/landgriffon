import axios from 'axios';
import Jsona from 'jsona';
import { signOut } from 'next-auth/react';

const dataFormatter = new Jsona();

const interventionsService = axios.create({
  baseURL: `${
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL
  }/api/v1/scenario-interventions`,
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

const onResponseSuccess = (response) => response;

const onResponseError = (error) => {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  if (error.response.status === 401) {
    signOut();
  }
  // Do something with response error
  return Promise.reject(error);
};

interventionsService.interceptors.response.use(onResponseSuccess, onResponseError);

export const getInterventions = (params) =>
  interventionsService.get('/', { params }).then(({ data }) => data);

export default interventionsService;
