import { useQuery } from '@tanstack/react-query';
import chroma from 'chroma-js';

import { colorScaleByLegendType } from './utils';

import { apiRawService } from 'services/api';
import { analysisFilters } from 'store/features/analysis';
import queryKeyStore, { type QueryKeys } from '@/lib/react-query/querykey-store';
import { useAppSelector } from 'store/hooks';
import { ErrorResponse, H3APIResponse, H3Item, Layer } from 'types';

import type { AxiosResponse } from 'axios';
import type { UseQueryOptions } from '@tanstack/react-query';

const responseContextualParser = (response: AxiosResponse<H3APIResponse>): H3APIResponse => {
  const { data, metadata } = response.data;
  const {
    legend: { items, type },
  } = metadata;
  const threshold = items.map((item) => item.value);
  const colors = items.map((item) => chroma(item.color).rgb());

  const scale = colorScaleByLegendType(type, threshold, colors);

  const h3DataWithColor: H3Item[] = data.map(
    (d: H3Item): H3Item => ({
      ...d,
      c: scale(Number(d.v) as H3Item['v']),
    }),
  );

  return { data: h3DataWithColor, metadata };
};

const useH3ContextualData = <T = H3APIResponse>(
  id: Layer['id'],
  options?: UseQueryOptions<
    H3APIResponse,
    ErrorResponse,
    T,
    QueryKeys['h3data']['layer']['queryKey']
  >,
) => {
  const filters = useAppSelector(analysisFilters);
  const { startYear } = filters;

  const params = {
    year: startYear,
    resolution: 4,
  };

  return useQuery(
    queryKeyStore.h3data.layer(id, params).queryKey,
    () =>
      apiRawService
        .get<H3APIResponse>(`/contextual-layers/${id}/h3data`, {
          params,
        })
        // Adding color to the response
        .then((response) => responseContextualParser(response)),
    {
      ...options,
      staleTime: 60 * 1000 * 15,
      enabled: (options.enabled ?? true) && !!id && !!startYear,
    },
  );
};

export default useH3ContextualData;
