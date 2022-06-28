import { useMemo } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
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
