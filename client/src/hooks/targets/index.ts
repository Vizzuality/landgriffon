import { useMemo } from 'react';
import type { UseQueryResult, UseQueryOptions } from 'react-query';
import { useQuery } from 'react-query';

import { apiService } from 'services/api';

import type { Target } from 'types';

const TARGETS_DATA: Target[] = [
  {
    id: '1',
    name: 'Test indicator',
    indicatorId: '234',
    baselineYear: 0,
    baselineValue: 1,
    years: [
      {
        year: 2020,
        percentage: 30,
        value: null,
      },
      {
        year: 2030,
        percentage: 45,
        value: null,
      },
      {
        year: 2040,
        percentage: 53,
        value: null,
      },
      {
        year: 2050,
        percentage: 60,
        value: null,
      },
    ],
  },
];

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

  return useMemo<ResponseData>((): ResponseData => {
    const data = response.isSuccess && response.data.length ? response : TARGETS_DATA;
    return {
      ...response,
      data,
    } as ResponseData;
  }, [response]);
}
