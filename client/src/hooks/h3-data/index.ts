import { useMemo } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import chroma from 'chroma-js';
import { scaleThreshold } from 'd3-scale';
import { useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';
import { analysisMap } from 'store/features/analysis/map';

import { apiRawService } from 'services/api';

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

export function useColors(): RGBColor[] {
  const { layer } = useAppSelector(analysisFilters);
  const colors = useMemo(() => COLOR_RAMPS[layer].map((color) => chroma(color).rgb()), [layer]);
  return colors;
}

export function useH3MaterialData(): H3DataResponse {
  const { layers } = useAppSelector(analysisMap);
  const filters = useAppSelector(analysisFilters);
  const { startYear } = filters;
  const isEnable = !!(layers.material.active && layers.material.material && startYear);

  const colors = useColors();
  const params: MaterialH3APIParams = {
    year: startYear,
    materialId: layers.material.material && layers.material.material.value,
    resolution: 4,
  };

  const query = useQuery(
    ['h3-data-material', JSON.stringify(filters)],
    async () =>
      apiRawService
        .get('/h3/map/material', {
          params,
        })
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: isEnable,
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
  const { layers } = useAppSelector(analysisMap);
  const filters = useAppSelector(analysisFilters);
  const { startYear, indicator } = filters;
  const isEnable = !!(layers.material.material && indicator && startYear);

  const colors = useColors();
  const params: RiskH3APIParams = {
    year: startYear,
    indicatorId: indicator?.value,
    materialId: layers.material.material && layers.material.material.value,
    resolution: 4,
  };

  const query = useQuery(
    ['h3-data-risk', JSON.stringify(filters)],
    async () =>
      apiRawService
        .get('/h3/map/risk', {
          params,
        })
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: isEnable,
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
  const filters = useAppSelector(analysisFilters);
  const { startYear, materials, indicator, suppliers, origins } = filters;
  const isEnable = !!(indicator && startYear);

  const colors = useColors();
  const params: ImpactH3APIParams = {
    year: startYear,
    indicatorId: indicator?.value && indicator?.value !== 'all' ? indicator?.value : null,
    ...(materials?.length ? { materialIds: materials?.map(({ value }) => value) } : {}),
    ...(suppliers?.length ? { supplierIds: suppliers?.map(({ value }) => value) } : {}),
    ...(origins?.length ? { originIds: origins?.map(({ value }) => value) } : {}),
    resolution: origins?.length ? 6 : 4,
  };

  const query = useQuery(
    ['h3-data-impact', JSON.stringify(filters)],
    async () =>
      apiRawService
        .get('/h3/map/impact', {
          params,
        })
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: isEnable,
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
