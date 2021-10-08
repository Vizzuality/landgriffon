import axios from 'axios';
import { signOut } from 'next-auth/client';

const h3DataService = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/h3`,
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

h3DataService.interceptors.response.use(onResponseSuccess, onResponseError);

export default h3DataService;
