import { useQuery, useQueries } from '@tanstack/react-query';
import chroma from 'chroma-js';
import { useMemo } from 'react';

import { DEFAULT_QUERY_OPTIONS, scaleByLegendType } from './utils';

import { apiRawService } from 'services/api';
import { analysisFilters, analysisMap } from 'store/features/analysis';
import { useAppSelector } from 'store/hooks';

import type { H3APIResponse, H3Data, H3Item, Layer } from 'types';
import type { AxiosResponse } from 'axios';
import type { QueryFunction, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

const responseContextualParser = (response: AxiosResponse<H3APIResponse>): H3APIResponse => {
  const { data, metadata } = response.data;
  const {
    legend: { items, type },
  } = metadata;
  const threshold = items.map((item) => item.value);
  const colors = items.map((item) => chroma(item.color).rgb());

  const scale = scaleByLegendType(type, threshold, colors);

  const h3DataWithColor: H3Item[] = data.map(
    (d: H3Item): H3Item => ({
      ...d,
      c: scale(d.v as H3Item['v']),
    }),
  );
  return { data: h3DataWithColor, metadata };
};

// The fetch function is the same when fetching one or more layers
const fetchContextualLayerData: QueryFunction<
  H3APIResponse,
  ['h3-data-contextual', Layer['id'], Record<string, string>]
> = ({ queryKey: [, id, urlParams] }) =>
  apiRawService
    .get(`/contextual-layers/${id}/h3data`, {
      params: urlParams,
    })
    // Adding color to the response
    .then((response) => responseContextualParser(response));

const useH3ContextualData = <T = H3APIResponse>(
  id: string,
  options: UseQueryOptions<H3APIResponse, unknown, T> = {},
) => {
  const filters = useAppSelector(analysisFilters);
  const { startYear, materials, indicator, suppliers, origins, locationTypes } = filters;
  const urlParams = {
    year: startYear,
    indicatorId: indicator?.value && indicator?.value === 'all' ? null : indicator?.value,
    ...(materials?.length ? { materialIds: materials?.map(({ value }) => value) } : {}),
    ...(suppliers?.length ? { supplierIds: suppliers?.map(({ value }) => value) } : {}),
    ...(origins?.length ? { originIds: origins?.map(({ value }) => value) } : {}),
    ...(locationTypes?.length ? { locationTypes: locationTypes?.map(({ value }) => value) } : {}),
    resolution: origins?.length ? 6 : 4,
  };

  const query = useQuery(['h3-data-contextual', id, urlParams], fetchContextualLayerData, {
    ...DEFAULT_QUERY_OPTIONS,
    placeholderData: {
      data: [],
      metadata: {
        name: null,
        legend: {
          unit: null,
          items: [],
        },
      },
    },
    ...options,
    enabled: (options.enabled ?? true) && !!id && !!urlParams.year,
  });

  return query;
};

export const useAllContextualLayersData = (options: Partial<UseQueryOptions> = {}) => {
  const { layers } = useAppSelector(analysisMap);
  const filters = useAppSelector(analysisFilters);
  const { startYear, materials, indicator, suppliers, origins, locationTypes } = filters;
  const urlParams = {
    year: startYear,
    indicatorId: indicator?.value && indicator?.value === 'all' ? null : indicator?.value,
    ...(materials?.length ? { materialIds: materials?.map(({ value }) => value) } : {}),
    ...(suppliers?.length ? { supplierIds: suppliers?.map(({ value }) => value) } : {}),
    ...(origins?.length ? { originIds: origins?.map(({ value }) => value) } : {}),
    ...(locationTypes?.length ? { locationTypes: locationTypes?.map(({ value }) => value) } : {}),
    resolution: origins?.length ? 6 : 4,
  };

  const queries = useQueries({
    queries: Object.values(layers)
      .filter((layer) => layer.isContextual)
      .map((layer) => ({
        queryKey: ['h3-data-contextual', layer.id, urlParams],
        queryFn: fetchContextualLayerData,
        ...DEFAULT_QUERY_OPTIONS,
        keepPreviousData: true,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
        select: (data: H3APIResponse) => ({ ...data, layerId: layer.id }),
        enabled: (options.enabled ?? true) && layer.active && !!layer.id && !!urlParams.year,
      })),
  });

  const map = useMemo(
    () =>
      new Map(
        queries.map(({ data: { layerId, ...data }, ...rest }) => [
          layerId,
          { ...data, ...rest } as UseQueryResult<H3Data>,
        ]),
      ),
    [queries],
  );
  return map;
};

export default useH3ContextualData;
