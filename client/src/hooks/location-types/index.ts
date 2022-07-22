import { useMemo } from 'react';
import type { UseQueryResult, UseQueryOptions } from 'react-query';
import { useQuery } from 'react-query';
import { apiRawService } from 'services/api';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

export type LocationTypesParams = {
  materialIds?: string[];
  supplierIds?: string[];
  businessUnitIds?: string[];
  originIds?: string[];
};

export type LocationType = {
  label: string;
  value: 'point-of-production' | 'aggregation-point' | 'country-of-production' | 'unknown';
};

type ResponseData = UseQueryResult<LocationType[]>;

export function useLocationTypes(
  params: LocationTypesParams,
  options: UseQueryOptions = {},
): ResponseData {
  const query = useQuery(
    ['location-types', JSON.stringify(params)],
    () =>
      apiRawService
        .request({
          method: 'GET',
          url: '/sourcing-locations/location-types',
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
