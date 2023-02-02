import { useQuery } from '@tanstack/react-query';

import { apiRawService } from 'services/api';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { BaseTreeSearchParams } from 'containers/analysis-visualization/analysis-filters/more-filters/types';
import type { LocationTypes } from 'containers/interventions/enums';
import type { Option } from 'components/forms/select';

const DEFAULT_QUERY_OPTIONS = {
  placeholderData: [],
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

export interface LocationTypesParams extends BaseTreeSearchParams {
  supplierIds?: string[];
}

export const useLocationTypes = <T = Option<LocationTypes>[]>(
  params: LocationTypesParams = {},
  options?: UseQueryOptions<Option<LocationTypes>[], unknown, T, ['location-types', typeof params]>,
) => {
  const query = useQuery(
    ['location-types', params],
    () =>
      apiRawService
        .request<{ data: Option<LocationTypes>[] }>({
          method: 'GET',
          url: '/sourcing-locations/location-types/supported',
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
