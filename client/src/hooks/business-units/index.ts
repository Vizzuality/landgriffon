import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiService } from 'services/api';
import { recursiveMap, recursiveSort } from 'components/tree-select/utils';

import type { UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import type { BusinessUnits, BusinessUnitsTreeItem } from 'types';
import type { TreeSelectOption } from 'components/tree-select/types';

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
  t1SupplierIds?: string[];
  producerIds?: string[];
  originIds?: string[];
  locationTypes?: string[];
  scenarioIds?: string[];
};

export function useBusinessUnits(): ResponseData {
  const query = useQuery(
    ['business-units'],
    () =>
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
      }) as ResponseData,
    [query, isError, data],
  );
}

export function useBusinessUnitsTrees(params: BusinessUnitsTreesParams): ResponseData {
  const query = useQuery(
    ['business-units-trees', params],
    () =>
      apiService
        .request<{ data: BusinessUnits }>({
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
      }) as ResponseData,
    [query, isError, data],
  );
}

type BusinessUnitsOption = TreeSelectOption & {
  disabled?: boolean;
  children?: BusinessUnitsOption[];
};

export const useBusinessUnitsOptionsTrees = <T = BusinessUnitsOption[]>(
  params: BusinessUnitsTreesParams = {},
  options: UseQueryOptions<{ data: BusinessUnitsTreeItem[] }, unknown, T> = {},
): UseQueryResult<T, unknown> => {
  const query = useQuery<{ data: BusinessUnitsTreeItem[] }, unknown, T>(
    ['business-units-trees-options', params],
    () =>
      apiService
        .request<{ data: BusinessUnitsTreeItem[] }>({
          method: 'GET',
          url: '/business-units/trees',
          params,
        })
        .then((responseData) => responseData.data),
    {
      retry: false,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      placeholderData: { data: [] },
      ...options,
      select: (_businessUnits) =>
        recursiveSort(_businessUnits?.data, 'name')?.map((item) =>
          recursiveMap(item, ({ id, name, status }) => ({
            value: id,
            label: name,
            disabled: status === 'inactive',
          })),
        ) as T,
    },
  );

  return query;
};
