import { useMemo } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { v4 as uuidv4 } from 'uuid';

import { apiWithMetadataService } from 'services/api';
import { SourcingLocation, APIMetadataPagination } from 'types';

type SourcingLocationsAPIResponse = {
  data: SourcingLocation[];
  metadata: APIMetadataPagination;
};

type SourcingLocationsDataResponse = UseQueryResult & SourcingLocationsAPIResponse;

export type SourcingLocationsParams = {
  materialsData?: boolean;
  'page[number]'?: number;
  'page[size]'?: number;
};

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: false,
  refetchOnWindowFocus: false,
};

export function useSourcingLocations(
  params: SourcingLocationsParams,
): SourcingLocationsDataResponse {
  // const [session] = useSession();

  const query = useQuery(
    ['sourcingLocations', params],
    async () =>
      apiWithMetadataService
        .request({
          method: 'GET',
          url: '/sourcing-locations',
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

  const { data: response } = query;

  return useMemo<SourcingLocationsDataResponse>(
    () =>
      ({
        ...query,
        data:
          // The endpoint is not returning ids, and we cannot use `materialId` because there
          // are duplicates. This causes issues with our tables, not only errors but also
          // duplicate rows when updating the table data. A workaround is to generate uuids.
          // We won't be loading many rows at once so it shouldn't be a huge performance hit.
          ((response as SourcingLocationsAPIResponse).data || []).map((data) => ({
            id: uuidv4(),
            ...data,
          })) || DEFAULT_QUERY_OPTIONS.placeholderData,
        metadata: (response as SourcingLocationsAPIResponse).metadata || {},
      } as SourcingLocationsDataResponse),
    [query, response],
  );
}
