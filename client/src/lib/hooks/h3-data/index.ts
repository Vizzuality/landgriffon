import { useMemo } from 'react';
import { useQuery } from 'react-query';
import chroma from 'chroma-js';
import { scaleThreshold } from 'd3-scale';
import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';

import h3DataService from 'services/h3-data';

import { COLOR_RAMPS } from 'containers/analysis-visualization/constants';

const DEFAULT_QUERY_OPTIONS = {
  placeholderData: {
    data: [],
    metadata: {
      unit: null,
      name: null,
      quantiles: [],
    },
  },
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};

const responseParser = (response, colors) => {
  const { data, metadata } = response.data;
  const { quantiles } = metadata;
  const threshold = quantiles.slice(1, -1);
  const scale = scaleThreshold().domain(threshold).range(colors);
  const h3DataWithColor = data.map((d) => ({ ...d, c: scale(d.v) }));
  return { data: h3DataWithColor, metadata };
};

export function useColors() {
  const { layer } = useAppSelector(analysis);
  const colors = useMemo(() => COLOR_RAMPS[layer].map((color) => chroma(color).rgb()), [layer]);
  return colors;
}

export function useH3MaterialData() {
  const {
    layer,
    filters: { materials },
  } = useAppSelector(analysis);

  const colors = useColors();

  const query = useQuery(
    ['h3-data-material', layer, JSON.stringify(materials)],
    async () =>
      h3DataService
        .get('/material', {
          params: {
            materialId: materials[0].value,
            resolution: 4,
          },
        })
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: layer === 'material' && materials.length > 0,
    }
  );

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data,
    };
  }, [query, data]);
}

export function useH3RiskData() {
  const {
    layer,
    filters: { indicator, materials },
  } = useAppSelector(analysis);

  const colors = useColors();

  const query = useQuery(
    ['h3-data-risk', layer, JSON.stringify(materials)],
    async () =>
      h3DataService
        .get('/risk-map', {
          params: {
            indicatorId: indicator,
            materialId: materials[0],
            resolution: 4,
            year: 2000,
          },
        })
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: layer === 'risk' && materials.length > 0,
    }
  );

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data,
    };
  }, [query, data]);
}
