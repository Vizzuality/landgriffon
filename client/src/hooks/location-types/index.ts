import { useMemo } from 'react';
import type { UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { apiRawService } from 'services/api';
import type { BaseTreeSearchParams } from 'containers/analysis-visualization/analysis-filters/more-filters/types';

import type { LocationTypes } from 'containers/interventions/enums';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

export interface LocationTypesParams extends BaseTreeSearchParams {
  supplierIds?: string[];
}

export type LocationType = {
  label: string;
  value: LocationTypes;
};

type ResponseData = UseQueryResult<LocationType[]>;

export function useLocationTypes(
  params: LocationTypesParams,
  options: UseQueryOptions = {},
): ResponseData {
  const query = useQuery(
    ['location-types', JSON.stringify(params)],
    () =>
      apiRawService
        .request<{ data: LocationType[] }>({
          method: 'GET',
          url: '/sourcing-locations/location-types',
          params,
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
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
