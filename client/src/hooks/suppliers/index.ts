import { useQuery } from '@tanstack/react-query';

import { apiService } from 'services/api';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { Supplier } from 'types';
import type { BaseTreeSearchParams } from 'containers/analysis-visualization/analysis-filters/more-filters/types';

const DEFAULT_QUERY_OPTIONS = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

export type SupplierTypesParams = {
  type: 't1supplier' | 'producer';
  materialIds?: string[];
  businessUnitIds?: string[];
  originIds?: string[];
  t1SupplierIds?: string[];
  producerIds?: string[];
  locationTypes?: string[];
  scenarioIds?: string[];
  sort?: string;
};

export interface SuppliersTreesParams extends BaseTreeSearchParams {
  withSourcingLocations?: boolean;
  locationTypes?: string[];
}

export const useSuppliers = <T = Supplier[]>(
  params,
  options?: UseQueryOptions<Supplier[], unknown, T, ['suppliers', typeof params]>,
) => {
  const query = useQuery(
    ['suppliers', params],
    () =>
      apiService
        .request({
          method: 'GET',
          url: '/suppliers',
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

export const useSuppliersTrees = <T = Supplier[]>(
  params: SuppliersTreesParams = {},
  options?: UseQueryOptions<Supplier[], unknown, T, ['suppliers-trees', typeof params]>,
) => {
  const query = useQuery(
    ['suppliers-trees', params],
    () =>
      apiService
        .request<{ data: Supplier[] }>({
          method: 'GET',
          url: '/suppliers/trees',
          params,
        })
        .then(({ data: responseData }) => responseData.data),
    { ...DEFAULT_QUERY_OPTIONS, ...options },
  );

  return query;
};

export const useSuppliersTypes = <T = Supplier[]>(
  params: SupplierTypesParams = { type: 't1supplier', sort: 'ASC' },
  options?: UseQueryOptions<Supplier[], unknown, T, ['suppliers', typeof params]>,
) => {
  const query = useQuery(
    ['suppliers', params],
    () =>
      apiService
        .request<{ data: Supplier[] }>({
          method: 'GET',
          url: 'suppliers/types',
          params,
        })
        .then(({ data: responseData }) => responseData.data),
    { ...DEFAULT_QUERY_OPTIONS, ...options },
  );

  return query;
};

export const useUnknowSupplier = () => {
  const query = useQuery(
    ['unknown-supplier'],
    () =>
      apiService
        .request<{ data: Supplier }>({
          method: 'GET',
          url: 'suppliers',
          params: { 'filter[name]': 'Unknown' },
        })
        .then(({ data: responseData }) => responseData.data?.[0]),
    { ...DEFAULT_QUERY_OPTIONS, staleTime: Infinity },
  );
  return query;
};
