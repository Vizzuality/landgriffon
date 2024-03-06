import { useQuery } from '@tanstack/react-query';

import { apiService } from 'services/api';

import type { Supplier } from '@/containers/analysis-eudr/supplier-list-table/table';
import type { UseQueryOptions } from '@tanstack/react-query';

export const useEUDRSuppliers = <T = Supplier[]>(
  params?: { producersIds: string[]; originsId: string[]; materialsId: string[] },
  options: UseQueryOptions<Supplier[], unknown, T> = {},
) => {
  return useQuery(
    ['eudr-suppliers', params],
    () =>
      apiService
        .request<{ data: Supplier[] }>({
          method: 'GET',
          url: '/eudr/suppliers',
          params,
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...options,
    },
  );
};
