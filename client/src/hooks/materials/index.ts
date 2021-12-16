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
type TreeParams = {
  depth?: number;
};

export function useMaterials(): ResponseData {
  // const [session] = useSession();

  const query = useQuery(
    ['materials'],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/materials',
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

export function useMaterialsTrees(params: TreeParams): ResponseData {
  // const [session] = useSession();

  const query = useQuery(
    ['materials-trees'],
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
