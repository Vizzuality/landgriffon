import { useMemo } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import chroma from 'chroma-js';
import { scaleThreshold } from 'd3-scale';
import store from 'store';
import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';
import { filtersForH3API } from 'store/features/analysis/selector';

import h3DataService from 'services/h3-data';

import { COLOR_RAMPS } from 'containers/analysis-visualization/constants';

import type { AxiosResponse } from 'axios';
import type {
  RGBColor,
  H3APIResponse,
  H3Item,
  MaterialH3APIParams,
  RiskH3APIParams,
  ImpactH3APIParams,
} from 'types';

type H3DataResponse = UseQueryResult<H3APIResponse, unknown>;

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: {
    data: [],
    metadata: {
      unit: null,
      quantiles: [],
    },
  },
  retry: false,
  keepPreviousData: true,
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

export function useColors(): RGBColor[] {
  const { layer } = useAppSelector(analysis);
  const colors = useMemo(() => COLOR_RAMPS[layer].map((color) => chroma(color).rgb()), [layer]);
  return colors;
}

export function useH3MaterialData(): H3DataResponse {
  const { layer } = useAppSelector(analysis);
  const filters = filtersForH3API(store.getState()) as MaterialH3APIParams;
  const isEnable = !!filters.materialId;

  const colors = useColors();

  const query = useQuery(
    ['h3-data-material', layer, JSON.stringify({ layer, ...filters })],
    async () =>
      h3DataService
        .get('/map/material', {
          params: {
            ...filters,
            resolution: 4,
          },
        })
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: layer === 'material' && isEnable,
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

export function useH3RiskData(): H3DataResponse {
  const { layer } = useAppSelector(analysis);
  const filters = filtersForH3API(store.getState()) as RiskH3APIParams;
  const isEnable = !!filters.materialId && !!filters.indicatorId;

  const colors = useColors();

  const query = useQuery(
    ['h3-data-risk', layer, JSON.stringify({ layer, ...filters })],
    async () =>
      h3DataService
        .get('/map/risk', {
          params: {
            ...filters,
            resolution: 4,
          },
        })
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: layer === 'risk' && isEnable,
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

export function useH3ImpactData(): H3DataResponse {
  const { layer } = useAppSelector(analysis);
  const filters = filtersForH3API(store.getState()) as ImpactH3APIParams;
  const isEnable = !!filters.indicatorId;

  const colors = useColors();

  const query = useQuery(
    ['h3-data-impact', layer, JSON.stringify({ layer, ...filters })],
    async () =>
      h3DataService
        .get('/map/impact', {
          params: {
            ...filters,
            resolution: 4,
          },
        })
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: layer === 'impact' && isEnable,
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
