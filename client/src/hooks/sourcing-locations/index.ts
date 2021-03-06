import { useMemo } from 'react';
import type { UseQueryOptions, UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import { v4 as uuidv4 } from 'uuid';

import apiService from 'services/api';
import type { SourcingLocation, APIMetadataPagination } from 'types';

type SourcingLocationsMaterialsAPIResponse = {
  data: SourcingLocation[];
  meta: APIMetadataPagination;
};

type SourcingLocationsMaterialsDataResponse = UseQueryResult &
  SourcingLocationsMaterialsAPIResponse;

export type SourcingLocationsParams = {
  search?: string;
  'page[number]'?: number;
  'page[size]'?: number;
};

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: false,
  refetchOnWindowFocus: false,
};
export function useSourcingLocationsMaterials(
  params: SourcingLocationsParams,
): SourcingLocationsMaterialsDataResponse {
  const query = useQuery(
    ['sourcingLocationsMaterials', params],
    async () =>
      apiService
        .request({
          method: 'GET',
          url: '/sourcing-locations/materials',
          params,
        })
        .then((response) => response.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
    },
  );

  const { data: response } = query;

  return useMemo<SourcingLocationsMaterialsDataResponse>(
    () =>
      ({
        ...query,
        data:
          // The endpoint is not returning ids, and we cannot use `materialId` because there
          // are duplicates. This causes issues with our tables, not only errors but also
          // duplicate rows when updating the table data. A workaround is to generate uuids.
          // We won't be loading many rows at once so it shouldn't be a huge performance hit.
          ((response as SourcingLocationsMaterialsAPIResponse).data || []).map((data) => ({
            id: uuidv4(),
            ...data,
          })) || DEFAULT_QUERY_OPTIONS.placeholderData,
        meta: (response as SourcingLocationsMaterialsAPIResponse).meta || {},
      } as SourcingLocationsMaterialsDataResponse),
    [query, response],
  );
}
