import { useQuery } from '@tanstack/react-query';

import { DEFAULT_QUERY_OPTIONS, responseParser } from '../utils';

import { apiRawService } from 'services/api';
import { useColors, COLOR_RAMPS } from 'utils/colors';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { H3APIResponse, ImpactH3APIParams } from 'types';
import type { H3ImpactResponse } from '../utils';

const useH3ImpactData = <T = H3ImpactResponse>(
  params: ImpactH3APIParams,
  options: UseQueryOptions<H3ImpactResponse, unknown, T> = {},
) => {
  const colors = useColors('impact', COLOR_RAMPS);

  const isEnable = (options.enabled ?? true) && !!(params.indicatorId && params.year);

  const query = useQuery(
    ['h3-data-impact', params],
    () =>
      apiRawService
        .get<H3APIResponse>('/h3/map/impact', {
          params,
        })
        .then((response) => response.data)
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
      enabled: isEnable,
    },
  );

  return query;
};

export default useH3ImpactData;
