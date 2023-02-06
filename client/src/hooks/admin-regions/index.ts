import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiService } from 'services/api';

import type { UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import type { OriginRegion } from 'types';
import type { BaseTreeSearchParams } from 'containers/analysis-visualization/analysis-filters/more-filters/types';

const DEFAULT_QUERY_OPTIONS = {
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

export const useAdminRegions = <T = OriginRegion[]>(
  options: UseQueryOptions<OriginRegion[], unknown, T>,
) => {
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
};

export const useAdminRegionsTrees = <T = OriginRegion[]>(
  params: AdminRegionsTreesParams,
  options: UseQueryOptions<OriginRegion[], unknown, T> = {},
) => {
  const query = useQuery(
    ['admin-regions-trees', params],
    () =>
      apiService
        .request<{ data: OriginRegion[] }>({
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

  return query;
};

export const useAdminRegionsByCountry = <T = OriginRegion[]>(
  countryId: string,
  params?: AdminRegionsTreesParams,
  options: UseQueryOptions<OriginRegion, unknown, T> = {},
) => {
  const query = useQuery(
    ['admin-regions-country-trees', countryId, params],
    () =>
      apiService
        .request<{ data: T }>({
          method: 'GET',
          url: `/admin-regions/${countryId}/regions`,
          params,
        })
        .then(({ data: responseData }) => responseData.data?.[0]),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
    },
  );

  return query;
};
