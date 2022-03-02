import { useMemo } from 'react';
import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import apiService from 'services/api';
import type { OriginRegion } from 'types';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

type ResponseData = UseQueryResult<OriginRegion[]>;

export type AdminRegionsTreesParams = {
  depth?: number;
  withSourcingLocations?: boolean;
};

export function useAdminRegions(): ResponseData {
  const query = useQuery(
    ['admin-regions'],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/impact/admin-regions/',
        })
        .then((response) => response.data),
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

export function useAdminRegionsTrees(params: AdminRegionsTreesParams): ResponseData {
  const query = useQuery(
    ['admin-regions-trees'],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/admin-regions/trees',
          params,
        })
        .then((response) => response.data),
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
