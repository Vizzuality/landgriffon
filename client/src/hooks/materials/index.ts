import { useQuery } from '@tanstack/react-query';

import { apiService } from 'services/api';

import type { UseQueryOptions } from '@tanstack/react-query';
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
  scenarioIds?: string[];
};

interface MaterialApiResponse {
  metadata: PaginationMetadata;
  data: Material[];
}

export const useMaterial = <T = Material>(
  id: Material['id'],
  { enabled, ...options }: Partial<UseQueryOptions<Material, unknown, T>> = {},
) => {
  const query = useQuery(
    ['material', id],
    () =>
      apiService.get<{ data: Material }>(`/materials/${id}`).then((response) => response.data.data),
    { ...options, enabled: (enabled ?? true) && !!id },
  );

  return query;
};

export const useMaterials = <T = MaterialApiResponse>(
  options?: Partial<UseQueryOptions<MaterialApiResponse, unknown, T>>,
) => {
  const query = useQuery(
    ['materials'],
    () =>
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
    () =>
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
