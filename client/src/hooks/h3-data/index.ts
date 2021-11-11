import { useMemo } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import chroma from 'chroma-js';
import { scaleThreshold } from 'd3-scale';
import store from 'store';
import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';
import { filtersForAPI } from 'store/features/analysis/selector';

import h3DataService from 'services/h3-data';

import { COLOR_RAMPS } from 'containers/analysis-visualization/constants';

import type { AxiosResponse } from 'axios';
import type { RGBColor, H3APIResponse, H3Item } from 'types';

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
  const filters = filtersForAPI(store.getState());
  const { materialIds, year } = filters;

  const colors = useColors();

  const query = useQuery(
    ['h3-data-material', layer, JSON.stringify(materialIds)],
    async () =>
      h3DataService
        .get('/material', {
          params: {
            materialId: materialIds[0],
            resolution: 4,
            year,
          },
        })
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: layer === 'material' && materialIds.length > 0,
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
  const filters = filtersForAPI(store.getState());
  const { indicatorId, materialIds, year } = filters;

  const colors = useColors();

  const query = useQuery(
    ['h3-data-risk', layer, JSON.stringify(materialIds)],
    async () =>
      h3DataService
        .get('/risk-map', {
          params: {
            indicatorId,
            materialId: materialIds[0],
            resolution: 4,
            year,
          },
        })
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: layer === 'risk' && materialIds.length > 0,
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
  const filters = filtersForAPI(store.getState());
  const { indicatorId, materialIds, groupBy, year } = filters;

  const colors = useColors();

  const query = useQuery(
    ['h3-data-impact', layer, JSON.stringify(materialIds)],
    async () =>
      h3DataService
        .get('/impact-map', {
          params: {
            indicatorId,
            materialId: materialIds[0],
            resolution: 4,
            groupBy,
            year,
          },
        })
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: layer === 'impact' && materialIds.length > 0,
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
