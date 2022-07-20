import { useMemo } from 'react';
import type { UseQueryOptions, UseQueryResult } from 'react-query';
import { useQueries } from 'react-query';
import { useQuery } from 'react-query';
import chroma from 'chroma-js';
import { scaleThreshold } from 'd3-scale';

import { useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';

import { apiRawService } from 'services/api';

import { COLOR_RAMPS } from 'utils/colors';

import type { AxiosResponse } from 'axios';
import type {
  RGBColor,
  H3APIResponse,
  H3Item,
  MaterialH3APIParams,
  RiskH3APIParams,
  ImpactH3APIParams,
  H3Data,
} from 'types';
import { analysisMap } from 'store/features/analysis';

type H3DataResponse = UseQueryResult<H3APIResponse, unknown>;
type H3ContextualResponse = H3DataResponse; // UseQueryResult<{ data: H3Data; metadata: LayerMetadata }, unknown>;

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
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

const responseParser = (response: AxiosResponse, colors: RGBColor[]): H3APIResponse => {
  const { data, metadata } = response.data;
  const { quantiles } = metadata;
  const threshold = quantiles.slice(1, -1);
  const scale = scaleThreshold<H3Item['v'], RGBColor>().domain(threshold).range(colors);
  const h3DataWithColor = data.map(
    (d: H3Item): H3Item => ({
      ...d,
      c: scale(d.v as H3Item['v']),
    }),
  );
  return { data: h3DataWithColor, metadata };
};

const responseContextualParser = (response: AxiosResponse): H3APIResponse => {
  const { data, metadata } = response.data;
  const {
    legend: { items },
  } = metadata;
  const threshold = items.map((item) => item.value);
  const colors = items.map((item) => chroma(item.color).rgb());
  const scale = scaleThreshold<H3Item['v'], RGBColor>().domain(threshold).range(colors);
  const h3DataWithColor = data.map(
    (d: H3Item): H3Item => ({
      ...d,
      c: scale(d.v as H3Item['v']),
    }),
  );
  return { data: h3DataWithColor, metadata };
};

export function useColors(layerName: string): RGBColor[] {
  const colors = useMemo(
    () => COLOR_RAMPS[layerName].map((color) => chroma(color).rgb()),
    [layerName],
  );
  return colors;
}

export function useH3MaterialData(
  params: Partial<MaterialH3APIParams> = {},
  options: Partial<UseQueryOptions> = {},
): H3DataResponse {
  const colors = useColors('material');
  const query = useQuery(
    ['h3-data-material', params],
    async () =>
      apiRawService
        .get('/h3/map/material', {
          params: {
            ...params,
            resolution: 4,
          },
        })
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

export function useH3RiskData(
  params: Partial<RiskH3APIParams> = {},
  options: Partial<UseQueryOptions> = {},
): H3DataResponse {
  const colors = useColors('risk');
  const query = useQuery(
    ['h3-data-risk', params],
    async () =>
      apiRawService
        .get('/h3/map/risk', {
          params: {
            ...params,
            resolution: 4,
          },
        })
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

export const useH3ContextualData = (
  id: string,
  // params: Partial<WaterH3APIParams>,
  options: Partial<UseQueryOptions>,
): H3ContextualResponse => {
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
  const query = useQuery(
    ['h3-data-contextual', id, urlParams],
    async () =>
      apiRawService
        .get(`/contextual-layers/${id}/h3data`, {
          params: urlParams,
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
      enabled: options.enabled && !!id && !!urlParams.year,
    },
  );

  const { data, isError } = query;

  return useMemo<H3ContextualResponse>(
    () =>
      ({
        ...query,
        data: (isError ? DEFAULT_QUERY_OPTIONS.placeholderData : data) as H3ContextualResponse,
      } as H3ContextualResponse),
    [query, isError, data],
  );
};

export const useAllContextual = (options?: Partial<UseQueryOptions>) => {
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

  const queries = useQueries(
    Object.values(layers)
      .filter((layer) => layer.isContextual)
      .map((layer) => ({
        queryKey: ['h3-data-contextual', layer.id, urlParams],
        queryFn: async () =>
          apiRawService
            .get(`/contextual-layers/${layer.id}/h3data`, {
              params: urlParams,
            })
            // Adding color to the response
            .then((response) => responseContextualParser(response)),
        ...DEFAULT_QUERY_OPTIONS,
        ...options,
        enabled:
          ('enabled' in (options || {}) ? options.enabled : true) &&
          layer.active &&
          !!layer.id &&
          !!urlParams.year,
        select: (data: H3APIResponse) => ({ ...data, layerId: layer.id }),
      })),
  );

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

export function useH3ImpactData(
  params: Partial<ImpactH3APIParams> = {},
  options: Partial<UseQueryOptions> = {},
): H3DataResponse {
  const filters = useAppSelector(analysisFilters);
  const { startYear, materials, indicator, suppliers, origins, locationTypes } = filters;

  const colors = useColors('impact');
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

  const isEnable = !!(urlParams.indicatorId && urlParams.year);

  const query = useQuery(
    ['h3-data-impact', filters],
    async () =>
      apiRawService
        .get('/h3/map/impact', {
          params: urlParams,
        })
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: isEnable,
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
