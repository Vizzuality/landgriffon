import { useMemo } from 'react';
import type { UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { apiService } from 'services/api';
import type { Material } from 'types';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
  staleTime: 2 * 60 * 1000, // 2 minutes max stale time
};

type ResponseData = UseQueryResult<Material[]>;

export type MaterialsTreesParams = {
  depth?: number;
  withSourcingLocations?: boolean;
  supplierIds?: string[];
  businessUnitIds?: string[];
  originIds?: string[];
  locationTypes?: string[];
  scenarioId?: string;
};

export function useMaterials(): ResponseData {
  const query = useQuery(
    ['materials'],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/materials',
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

export function useMaterialsTrees(
  params: MaterialsTreesParams = {},
  options: UseQueryOptions = {},
): ResponseData {
  const query = useQuery(
    ['materials-trees', params],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/materials/trees',
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
