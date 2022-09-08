import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { apiService } from 'services/api';
import type { Material, MaterialTreeItem } from 'types';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
  staleTime: 2 * 60 * 1000, // 2 minutes max stale time
};

export type MaterialsTreesParams = {
  depth?: number;
  withSourcingLocations?: boolean;
  supplierIds?: string[];
  businessUnitIds?: string[];
  originIds?: string[];
  locationTypes?: string[];
  scenarioId?: string;
};

export function useMaterials() {
  const query = useQuery(
    ['materials'],
    async () =>
      apiService
        .request<Material>({
          method: 'GET',
          url: '/materials',
        })
        .then((data) => data.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
    },
  );

  return query;
}

export function useMaterialsTrees(
  params: MaterialsTreesParams = {},
  options: UseQueryOptions = {},
) {
  const query = useQuery(
    ['materials-trees', params],
    async () =>
      apiService
        .request<{ data: MaterialTreeItem[] }>({
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

  return query;
}
