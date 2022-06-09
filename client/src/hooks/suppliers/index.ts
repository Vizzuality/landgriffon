import { useMemo } from 'react';
import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import { apiService } from 'services/api';
import type { Supplier } from 'types';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

type ResponseData = UseQueryResult<Supplier[]>;

export type SuppliersTreesParams = {
  depth?: number;
  withSourcingLocations?: boolean;
  materialIds?: string[];
  originIds?: string[];
  businessUnitIds?: string[];
  locationTypes?: string[];
};

export function useSuppliers(params): ResponseData {
  const query = useQuery(
    ['suppliers', JSON.stringify(params)],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/suppliers',
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

export function useSuppliersTrees(
  params: SuppliersTreesParams,
  options: UseQueryOptions = {},
): ResponseData {
  const query = useQuery(
    ['suppliers-trees', JSON.stringify(params)],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/suppliers/trees',
          params,
        })
        .then(({ data: responseData }) => responseData.data),
    { ...DEFAULT_QUERY_OPTIONS, ...options },
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

export function useSuppliersTypes(params: { type: 't1supplier' | 'producer' }): ResponseData {
  const query = useQuery(
    ['suppliers', JSON.stringify(params)],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: 'suppliers/types',
          params,
        })
        .then(({ data: responseData }) => responseData.data),
    DEFAULT_QUERY_OPTIONS,
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
