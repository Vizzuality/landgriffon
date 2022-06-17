import { useMemo } from 'react';
import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import { apiService } from 'services/api';
import type { Indicator } from 'types';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

type ResponseData = UseQueryResult<Indicator[]>;
type RespondeIndicatorData = UseQueryResult<Indicator>;

export function useIndicators(): ResponseData {
  const query = useQuery(
    ['indicators'],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/indicators',
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
    },
  );

  const { data, isError } = query;

  return useMemo<ResponseData>(
    () =>
      ({
        ...query,
        data: (isError ? DEFAULT_QUERY_OPTIONS.placeholderData : data) as ResponseData,
      } as ResponseData),
    [query, isError, data],
  );
}

export function useIndicator(id: Indicator['id']): RespondeIndicatorData {
  const query = useQuery(
    ['indicators', id],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: `/indicators/${id}`,
          params: { include: 'unit' },
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
    },
  );

  const { data, isError } = query;

  return useMemo<RespondeIndicatorData>(
    () =>
      ({
        ...query,
        data: (isError ? DEFAULT_QUERY_OPTIONS.placeholderData : data) as RespondeIndicatorData,
      } as RespondeIndicatorData),
    [query, isError, data],
  );
}
