import axios from 'axios';
import Jsona from 'jsona';
import { signOut } from 'next-auth/client';
import type { Scenario, ScenarioPayload } from 'containers/scenarios/types';

const dataFormatter = new Jsona();

const scenariosService = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL}/api/v1/scenarios`,
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

scenariosService.interceptors.response.use(onResponseSuccess, onResponseError);

export const getScenarios = () => scenariosService.get('/').then(({ data }) => data);

export const createScenario = (payload: ScenarioPayload) =>
  scenariosService.post('/', payload).then(({ data }) => data);

export const deleteScenario = (payload: Scenario['id']) =>
  scenariosService.delete(`/${payload}`).then(({ data }) => data);

export default scenariosService;
