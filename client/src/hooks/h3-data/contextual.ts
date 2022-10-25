import { useQuery, useQueries } from '@tanstack/react-query';
import chroma from 'chroma-js';

import { DEFAULT_QUERY_OPTIONS, scaleByLegendType } from './utils';

import { apiRawService } from 'services/api';
import { analysisFilters, analysisMap, scenarios } from 'store/features/analysis';
import { useAppSelector } from 'store/hooks';

import type { ContextualH3APIParams, ErrorResponse, H3APIResponse, H3Item, Layer } from 'types';
import type { AxiosResponse } from 'axios';
import type { UseQueryOptions, UseQueryResult, QueryFunction } from '@tanstack/react-query';

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

const useH3ContextualData = <T = H3APIResponse>(
  id: Layer['id'],
  options?: UseQueryOptions<
    H3APIResponse,
    ErrorResponse,
    T,
    ['h3-data-contextual', typeof id, ContextualH3APIParams]
  >,
) => {
  const filters = useAppSelector(analysisFilters);
  const { startYear, materials, indicator, suppliers, origins, locationTypes } = filters;
  const { comparisonMode } = useAppSelector(scenarios);

  const params = {
    year: startYear,
    indicatorId: indicator?.value && indicator?.value === 'all' ? null : indicator?.value,
    ...(materials?.length ? { materialIds: materials?.map(({ value }) => value) } : {}),
    ...(suppliers?.length ? { supplierIds: suppliers?.map(({ value }) => value) } : {}),
    ...(origins?.length ? { originIds: origins?.map(({ value }) => value) } : {}),
    ...(locationTypes?.length ? { locationTypes: locationTypes?.map(({ value }) => value) } : {}),
    relative: comparisonMode === 'relative',
    resolution: origins?.length ? 6 : 4,
  };

  const query = useQuery(
    ['h3-data-contextual', id, params],
    () =>
      apiRawService
        .get<H3APIResponse>(`/contextual-layers/${id}/h3data`, {
          params,
        })
        // Adding color to the response
        .then((response) => responseContextualParser(response)),
    {
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
      enabled: (options.enabled ?? true) && !!id && !!params.year,
    },
  );

  return query;
};

export const useAllContextualLayersData = <T = { layerId: Layer['id'] } & H3APIResponse>(
  options?: Omit<
    UseQueryOptions<
      { layerId: Layer['id'] } & H3APIResponse,
      ErrorResponse,
      T,
      ['h3-data-contextual-all', Layer['id'], ContextualH3APIParams]
    >,
    'context' | 'queryKey' | 'queryFn'
  >,
) => {
  const { layers } = useAppSelector(analysisMap);
  const { startYear, materials, indicator, suppliers, origins, locationTypes } =
    useAppSelector(analysisFilters);
  const { comparisonMode } = useAppSelector(scenarios);

  const urlParams: ContextualH3APIParams = {
    year: startYear,
    indicatorId: indicator?.value && indicator?.value === 'all' ? null : indicator?.value,
    ...(materials?.length ? { materialIds: materials?.map(({ value }) => value) } : {}),
    ...(suppliers?.length ? { supplierIds: suppliers?.map(({ value }) => value) } : {}),
    ...(origins?.length ? { originIds: origins?.map(({ value }) => value) } : {}),
    ...(locationTypes?.length ? { locationTypes: locationTypes?.map(({ value }) => value) } : {}),
    relative: comparisonMode === 'relative',
    resolution: origins?.length ? 6 : 4,
  };

  const queryList = Object.values(layers)
    .filter((layer) => layer.isContextual)
    .map((layer) => ({
      queryKey: ['h3-data-contextual-all', layer.id, urlParams] as const,
      queryFn: (({ queryKey: [, id, params] }) => {
        return (
          apiRawService
            .get<H3APIResponse>(`/contextual-layers/${id}/h3data`, {
              params: { ...params, relative: layer.comparisonMode === 'relative' },
            })
            // Adding color to the response
            .then((response) => {
              return responseContextualParser(response);
            })
            .then((response) => {
              return { layerId: id, ...response };
            })
        );
      }) as QueryFunction<
        H3APIResponse & { layerId: Layer['id'] },
        ['h3-data-contextual', Layer['id'], ContextualH3APIParams]
      >,
      keepPreviousData: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 10 * 60 * 1000, // 10 minutes
      ...options,
      enabled: (options?.enabled ?? true) && layer.active && !!layer.id && !!urlParams.year,
    }));

  const queries = useQueries({
    queries: queryList,
  }) as unknown[] as UseQueryResult<T, ErrorResponse>[];
  return queries;
};

export default useH3ContextualData;
