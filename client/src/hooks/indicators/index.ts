import { useMemo } from 'react';
import type { UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { apiService } from 'services/api';
import type { Indicator, PaginationMetadata } from 'types';

const DEFAULT_QUERY_OPTIONS = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

type ResponseData = { data: Indicator[]; meta: PaginationMetadata };
type ResponseIndicatorData = UseQueryResult<Indicator>;

export const useIndicators = <T = ResponseData>(
  options: UseQueryOptions<ResponseData, unknown, T> = {},
) => {
  const query = useQuery(
    ['indicators'],
    async () =>
      apiService
        .request<ResponseData>({
          method: 'GET',
          url: '/indicators',
        })
        .then(({ data }) => data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      placeholderData: { data: [], meta: {} },
      ...options,
    },
  );

  return query;
};

export function useIndicator(id: Indicator['id']): ResponseIndicatorData {
  const query = useQuery(
    ['indicators', id],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: id === 'all' ? '/indicators' : `/indicators/${id}`,
          params: { include: 'unit' },
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: !!id,
    },
  );

  const { data, isError } = query;

  return useMemo<ResponseIndicatorData>(
    () =>
      ({
        ...query,
        data: (isError ? DEFAULT_QUERY_OPTIONS.placeholderData : data) as ResponseIndicatorData,
      } as ResponseIndicatorData),
    [query, isError, data],
  );
}
