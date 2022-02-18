import { useMemo } from 'react';
import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import apiService from 'services/api';
import type { Material } from 'types';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

type ResponseData = UseQueryResult<Material[]>;

export type MaterialsTreesParams = {
  depth?: number;
  withSourcingLocations?: boolean;
};

export function useMaterials(): ResponseData {
  // const [session] = useSession();

  const query = useQuery(
    ['materials'],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: 'impact/materials',
          headers: {
            // Authorization: `Bearer ${session.accessToken}`,
          },
        })
        .then((response) => response.data),
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

export function useMaterialsTrees(params: MaterialsTreesParams): ResponseData {
  // const [session] = useSession();

  const query = useQuery(
    ['materials-trees', params],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/materials/trees',
          params,
          headers: {
            // Authorization: `Bearer ${session.accessToken}`,
          },
        })
        .then((response) => response.data),
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
