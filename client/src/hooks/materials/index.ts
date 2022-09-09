import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { apiService } from 'services/api';
import type { Material, MaterialTreeItem, PaginationMetadata } from 'types';

const DEFAULT_QUERY_OPTIONS = {
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

interface MaterialApiResponse {
  metadata: PaginationMetadata;
  data: Material[];
}

export const useMaterials = <T = MaterialApiResponse>(
  options?: Partial<UseQueryOptions<MaterialApiResponse, unknown, T>>,
) => {
  const query = useQuery(
    ['materials'],
    async () =>
      apiService
        .request<MaterialApiResponse>({
          method: 'GET',
          url: '/materials',
        })
        .then((data) => data.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      placeholderData: { data: [], metadata: null },
      ...options,
    },
  );

  return query;
};

interface MaterialsTreeResponse {
  data: MaterialTreeItem[];
}

export const useMaterialsTrees = <T = MaterialTreeItem[]>(
  params: MaterialsTreesParams = {},
  options: UseQueryOptions<MaterialTreeItem[], unknown, T> = {},
) => {
  const query = useQuery(
    ['materials-trees', params],
    async () =>
      apiService
        .request<MaterialsTreeResponse>({
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
};
