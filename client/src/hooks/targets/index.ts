import { useMemo } from 'react';
import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';

import { apiService } from 'services/api';

import type { Target } from 'types';

type ResponseData = UseQueryResult<Target[]>;
type QueryParams = {
  sort?: string;
  pageParam?: number;
};

const DEFAULT_QUERY_OPTIONS: UseQueryOptions<Target[]> = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

export function useTargets(queryParams: QueryParams = null): ResponseData {
  const response: ResponseData = useQuery<Target[]>(
    ['targetsList', queryParams],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/targets',
          params: queryParams,
        })
        .then(({ data: responseData }) => responseData.data),
    DEFAULT_QUERY_OPTIONS,
  );
  console.log('targets from api: ', response);
  return useMemo<ResponseData>((): ResponseData => response, [response]);
}
