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
};

export interface LocationTypesParams extends BaseTreeSearchParams {
  supplierIds?: string[];
  sort?: 'ASC' | 'DESC';
  // ! Due to an issue in NestJS framework (API side), sending supported with value `false`
  // ! will be treated as a truthy value, so for this specific case, do not send it.
  supported?: boolean;
}

export const useLocationTypes = <T = Option<LocationTypes>[]>(
  params: LocationTypesParams = {},
  options?: UseQueryOptions<Option<LocationTypes>[], unknown, T, ['location-types', typeof params]>,
) =>
  useQuery(
    ['location-types', params],
    () =>
      apiRawService
        .request<{ data: Option<LocationTypes>[] }>({
          method: 'GET',
          url: '/sourcing-locations/location-types',
          params: {
            sort: 'DESC',
            ...params,
          },
        })
        .then(({ data: responseData }) => responseData.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
    },
  );
