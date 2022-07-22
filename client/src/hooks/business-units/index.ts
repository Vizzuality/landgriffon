import { useMemo } from 'react';
import type { UseQueryResult, UseQueryOptions } from 'react-query';
import { useQuery } from 'react-query';
import { apiService } from 'services/api';
import type { BusinessUnits } from 'types';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

type ResponseData = UseQueryResult<BusinessUnits[]>;

export type BusinessUnitsTreesParams = {
  depth?: number;
  withSourcingLocations?: boolean;
  materialIds?: string[];
  supplierIds?: string[];
  originIds?: string[];
  locationTypes?: string[];
};

export function useBusinessUnits(): ResponseData {
  const query = useQuery(
    ['business-units'],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/business-units',
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

export function useBusinessUnitsTrees(params: BusinessUnitsTreesParams): ResponseData {
  const query = useQuery(
    ['business-units-trees', params],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/business-units/trees',
          params,
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
