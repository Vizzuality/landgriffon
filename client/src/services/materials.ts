import axios from 'axios';
import Jsona from 'jsona';
import { signOut } from 'next-auth/client';

const dataFormatter = new Jsona();

const materialsService = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/materials`,
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

materialsService.interceptors.response.use(onResponseSuccess, onResponseError);

export const getMaterials = (params) =>
  materialsService.get('/', { params }).then(({ data }) => data);
export const getMaterialsTrees = (params) =>
  materialsService.get('/trees', { params }).then(({ data }) => data);

export default materialsService;
