import axios from 'axios';
import { signOut } from 'next-auth/client';

const yearsService = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sourcing-records/years`,
  headers: { 'Content-Type': 'application/json' },
  transformResponse: (response) => {
    try {
      const parsedData = JSON.parse(response);
      return parsedData;
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

yearsService.interceptors.response.use(onResponseSuccess, onResponseError);

export const getYears = (params) => yearsService.get('/', { params }).then(({ data }) => data);

export default yearsService;
