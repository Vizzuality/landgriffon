import Axios, { AxiosRequestConfig, AxiosError } from 'axios';

import { authorizedRequest, onResponseError } from './api';

export const apiService = Axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  headers: { 'Content-Type': 'application/json' },
});

apiService.interceptors.request.use(authorizedRequest, onResponseError);

// add a second `options` argument here if you want to pass extra options to each generated query
export const API = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = apiService({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error cancel is not part of the promise
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

// In some case with react-query and swr you want to be able to override the return error type so you can also do it here like this
export type ErrorType<Error> = AxiosError<Error>;

export type BodyType<BodyData> = BodyData;

export default API;
