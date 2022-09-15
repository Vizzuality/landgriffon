import { useMemo } from 'react';
import type { UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { apiService } from 'services/api';
import type { OriginRegion } from 'types';
import type { BaseTreeSearchParams } from 'containers/analysis-visualization/analysis-filters/more-filters/types';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

type ResponseData = UseQueryResult<OriginRegion[]>;

export interface AdminRegionsTreesParams extends BaseTreeSearchParams {
  withSourcingLocations?: boolean;
  supplierIds?: string[];
  locationTypes?: string[];
}

export function useAdminRegions(): ResponseData {
  const query = useQuery(
    ['admin-regions'],
    () =>
      apiService
        .request({
          method: 'GET',
          url: '/admin-regions',
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

export function useAdminRegionsTrees(
  params: AdminRegionsTreesParams,
  options: UseQueryOptions = {},
): ResponseData {
  const query = useQuery(
    ['admin-regions-trees', params],
    () =>
      apiService
        .request({
          method: 'GET',
          url: '/admin-regions/trees',
          params,
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
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
