import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { merge } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';

import apiService from 'services/api';

import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { SourcingLocation, APIMetadataPagination } from 'types';
import type { ApiSortParams } from 'components/table/types';

type SourcingLocationsMaterialsAPIResponse = {
  data: SourcingLocation[];
  meta: APIMetadataPagination;
};

type SourcingLocationsMaterialsDataResponse = UseQueryResult &
  SourcingLocationsMaterialsAPIResponse;

type SourcingLocationResponse = {
  data: { type: string; updatedAt: string }[];
  meta: APIMetadataPagination;
};

const DEFAULT_QUERY_OPTIONS = {
  placeholderData: { data: [], meta: { page: 1, size: 25, totalItems: 0, totalPages: 0 } },
  retry: false,
  keepPreviousData: false,
  refetchOnWindowFocus: false,
};

export type SourcingLocationsParams = {
  search?: string;
  fields?: string;
  'page[number]'?: number;
  'page[size]'?: number;
  disablePagination?: boolean;
} & Partial<ApiSortParams>;

export function useSourcingLocations(
  params: SourcingLocationsParams,
  queryOptions?: UseQueryOptions<SourcingLocationResponse>,
) {
  const query = useQuery<SourcingLocationResponse>(
    ['sourcingLocations', params],
    () =>
      apiService
        .request({
          method: 'GET',
          url: '/sourcing-locations',
          params,
        })
        .then((response) => response.data),
    {
      ...(DEFAULT_QUERY_OPTIONS as UseQueryOptions<SourcingLocationResponse>),
      ...queryOptions,
    },
  );

  return query;
}

export function useSourcingLocationsMaterials(
  params: SourcingLocationsParams,
  queryOptions?: UseQueryOptions<SourcingLocationsMaterialsAPIResponse>,
): SourcingLocationsMaterialsDataResponse {
  const query = useQuery<SourcingLocationsMaterialsAPIResponse>(
    ['sourcingLocationsMaterials', params],
    () =>
      apiService
        .request<SourcingLocationsMaterialsAPIResponse>({
          method: 'GET',
          url: '/sourcing-locations/materials',
          params,
        })
        .then((response) => response.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...queryOptions,
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
          })) || [],
        meta: (response as SourcingLocationsMaterialsAPIResponse).meta || {},
      } as SourcingLocationsMaterialsDataResponse),
    [query, response],
  );
}

export const useSourcingLocationsMaterialsTabularData = (
  sourcingData: SourcingLocationsMaterialsDataResponse['data'],
) => {
  // Getting all the years from the data
  const yearsFromData = useMemo(
    () =>
      Array.from(
        new Set(sourcingData.flatMap(({ purchases }) => purchases.map((p) => p.year))),
      ).sort(),
    [sourcingData],
  );

  // Preparing table columns by years from the range of filters
  const yearsData = useMemo(() => {
    return {
      columns: yearsFromData.map((year) => ({
        id: `${year}`,
        title: `${year}`,
        width: 80,
        visible: true,
      })),
      data: sourcingData.map(({ purchases, ...dataRow }) => ({
        ...dataRow,
        ...purchases
          .map(({ year, tonnage }) => ({ [year]: tonnage }))
          .reduce((a, b) => ({ ...a, ...b })),
      })),
    };
  }, [yearsFromData, sourcingData]);

  const sourcingDataParsed = useMemo(
    () => sourcingData.map(({ purchases, ...dataRow }) => dataRow),
    [sourcingData],
  );

  const data = useMemo(
    () => merge(sourcingDataParsed, yearsData.data),
    [sourcingDataParsed, yearsData.data],
  );

  return { yearsData, data };
};
