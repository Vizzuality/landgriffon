import { useMemo } from 'react';
import type { QueryFunction, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useQueries, useQuery } from '@tanstack/react-query';
import chroma from 'chroma-js';
import type { ScaleOrdinal, ScaleThreshold } from 'd3-scale';
import { scaleThreshold, scaleOrdinal } from 'd3-scale';

import { useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';

import { apiRawService } from 'services/api';

import { COLOR_RAMPS, useColors } from 'utils/colors';

import type { AxiosResponse } from 'axios';
import type { H3APIResponse } from 'types';
import type {
  RGBColor,
  H3Item,
  MaterialH3APIParams,
  RiskH3APIParams,
  ImpactH3APIParams,
  H3Data,
  Layer,
  Legend,
} from 'types';
import { analysisMap } from 'store/features/analysis';

type H3ImpactResponse = H3APIResponse & {
  metadata: {
    quantiles: number[];
    unit: string;
  };
};
type H3DataResponse = UseQueryResult<H3APIResponse, unknown>;
type H3ContextualResponse = H3DataResponse; // UseQueryResult<{ data: H3Data; metadata: LayerMetadata }, unknown>;

const DEFAULT_QUERY_OPTIONS = {
  placeholderData: {
    data: [],
    metadata: {
      unit: null,
      quantiles: [],
    },
  },
  retry: false,
  keepPreviousData: false,
  refetchOnWindowFocus: false,
};

const responseParser = (response: H3APIResponse, colors: RGBColor[]): H3APIResponse => {
  const threshold = response.metadata.quantiles.slice(1, -1);
  const scale = scaleThreshold<H3Item['v'], RGBColor>().domain(threshold).range(colors);
  const h3DataWithColor = response.data.map(
    (d: H3Item): H3Item => ({
      ...d,
      c: scale(d.v as H3Item['v']),
    }),
  );
  return { ...response, data: h3DataWithColor };
};

type ScalesType = ScaleOrdinal<H3Item['v'], H3Item['c']> | ScaleThreshold<H3Item['v'], H3Item['c']>;

const scaleByLegendType = (
  type: Legend['type'],
  threshold: Legend['items'][0]['value'][],
  colors: H3Item['c'][],
): ScalesType => {
  switch (type) {
    case 'category':
      return scaleOrdinal<H3Item['v'], H3Item['c']>()
        .domain(threshold as H3Item['v'][])
        .range(colors);
    default:
      return scaleThreshold<H3Item['v'], H3Item['c']>()
        .domain(threshold as number[])
        .range(colors);
  }
};

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

export const useH3MaterialData = <T = H3APIResponse>(
  params: Partial<MaterialH3APIParams> = {},
  options: Partial<UseQueryOptions<H3APIResponse, unknown, T>> = {},
) => {
  const colors = useColors('material', COLOR_RAMPS);
  const filters = useAppSelector(analysisFilters);
  const { startYear, materialId, origins } = filters;

  const urlParams = {
    year: startYear,
    materialId,
    ...params,
    resolution: origins?.length ? 6 : 4,
  };

  const enabled = (options.enabled ?? true) && !!urlParams.year && !!urlParams.materialId;

  const query = useQuery(
    ['h3-data-material', urlParams],
    () =>
      apiRawService
        .get<H3APIResponse>('/h3/map/material', {
          params: urlParams,
        })
        // Adding color to the response
        .then((response) => response.data)
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
      enabled,
    },
  );

  return query;
};

export function useH3RiskData(
  params: Partial<RiskH3APIParams> = {},
  options: Partial<UseQueryOptions> = {},
): H3DataResponse {
  const colors = useColors('risk', COLOR_RAMPS);
  const query = useQuery(
    ['h3-data-risk', params],
    () =>
      apiRawService
        .get('/h3/map/risk', {
          params: {
            ...params,
            resolution: 4,
          },
        })
        .then((response) => response.data)
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
    },
  );

  const { data, isError } = query;

  return useMemo<H3DataResponse>(
    () =>
      ({
        ...query,
        data: (isError ? DEFAULT_QUERY_OPTIONS.placeholderData : data) as H3APIResponse,
      } as H3DataResponse),
    [query, isError, data],
  );
}

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

export const useH3ContextualData = <T = H3APIResponse>(
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

export const useH3ImpactData = <T = H3ImpactResponse>(
  params: Partial<ImpactH3APIParams> = {},
  options: Partial<UseQueryOptions<H3ImpactResponse, unknown, T>> = {},
) => {
  const filters = useAppSelector(analysisFilters);
  const { startYear, materials, indicator, suppliers, origins, locationTypes } = filters;

  const colors = useColors('impact', COLOR_RAMPS);
  const urlParams: ImpactH3APIParams = {
    year: startYear,
    indicatorId: indicator?.value && indicator?.value === 'all' ? null : indicator?.value,
    ...(materials?.length ? { materialIds: materials?.map(({ value }) => value) } : {}),
    ...(suppliers?.length ? { supplierIds: suppliers?.map(({ value }) => value) } : {}),
    ...(origins?.length ? { originIds: origins?.map(({ value }) => value) } : {}),
    ...(locationTypes?.length ? { locationTypes: locationTypes?.map(({ value }) => value) } : {}),
    ...params,
    resolution: origins?.length ? 6 : 4,
  };

  const isEnable = (options.enabled ?? true) && !!(urlParams.indicatorId && urlParams.year);

  const query = useQuery<unknown, unknown, T>(
    ['h3-data-impact', filters],
    () =>
      apiRawService
        .get<H3APIResponse>('/h3/map/impact', {
          params: urlParams,
        })
        .then((response) => response.data)
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: isEnable,
      ...options,
    },
  );

  return query;
};

interface UseH3DataProps<T> {
  id: Layer['id'];
  params?: Partial<MaterialH3APIParams & ImpactH3APIParams>;
  options?: UseQueryOptions<H3APIResponse, unknown, T>;
}

export const useH3Data = <T = H3APIResponse>({
  id,
  params: { materialId } = {},
  options = {},
}: UseH3DataProps<T>) => {
  const { enabled = true } = options;
  const isContextual = !['impact', 'material'].includes(id);
  const isMaterial = id === 'material';
  const isImpact = id === 'impact';

  const materialQuery = useH3MaterialData(
    { materialId },
    {
      ...options,
      enabled: enabled && isMaterial,
    },
  );
  const impactQuery = useH3ImpactData(
    {},
    {
      ...options,
      enabled: enabled && isImpact,
    },
  );
  const contextualQuery = useH3ContextualData(id, {
    ...options,
    enabled: enabled && isContextual,
  });

  if (isImpact) return impactQuery;
  if (isMaterial) return materialQuery;
  return contextualQuery;
};
