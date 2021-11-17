import { useMemo } from 'react';
import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import adminRegionsService from 'services/suppliers';
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
      adminRegionsService
        .request({
          method: 'GET',
          url: `/`,
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
      adminRegionsService
        .request({
          method: 'GET',
          url: `/trees`,
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
