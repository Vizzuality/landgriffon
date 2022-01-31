import { useMemo } from 'react';
import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import apiService from 'services/api';
import type { Supplier } from 'types';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

type ResponseData = UseQueryResult<Supplier[]>;
type TreeParams = {
  depth?: number;
};

export function useSuppliers(): ResponseData {
  // const [session] = useSession();

  const query = useQuery(
    ['suppliers'],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: 'impact/suppliers',
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

export function useSuppliersTrees(params: TreeParams): ResponseData {
  // const [session] = useSession();

  const query = useQuery(
    ['suppliers-trees'],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/suppliers/trees',
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
