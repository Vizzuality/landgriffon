import { useMemo } from 'react';
import { useQuery } from 'react-query';
import chroma from 'chroma-js';
import { scaleThreshold } from 'd3-scale';

import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';

import h3DataService from 'services/h3-data';

import { COLOR_RAMPS } from 'containers/analysis-visualization/constants';

// Mock Metadata
// TO-DO: replace with metadata from API
const metadata = {
  unit: 'tonnes',
  name: 'Impact of deforestation loss due to land use change',
  quantiles: [
    1.04898646e-7, 80.596923828125, 0.0198405459523201, 0.0635268658399582, 0.289023560285568,
    0.6117558717727662, 10000,
  ].sort((a, b) => a - b),
};

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
  const { data } = response.data;
  const { quantiles } = metadata;
  const threshold = quantiles.slice(1, -1);
  const scale = scaleThreshold().domain(threshold).range(colors);
  const h3DataWithColor = data.map((d) => ({ ...d, c: scale(d.v) }));
  return { data: h3DataWithColor, metadata };
};

export function useColors() {
  const { dataset } = useAppSelector(analysis);
  const colors = useMemo(() => COLOR_RAMPS[dataset].map((color) => chroma(color).rgb()), [dataset]);
  return colors;
}

export function useH3MaterialData() {
  const {
    dataset,
    filters: { materials },
  } = useAppSelector(analysis);

  const colors = useColors();

  const query = useQuery(
    ['h3-data-material', dataset, JSON.stringify(materials)],
    async () =>
      h3DataService
        .get('/material', {
          params: {
            // TO-DO: replace with material ID
            materialId: 'bb5f553a-7056-4efa-995e-546bc7e458a6',
            resolution: 4,
          },
        })
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: dataset === 'material' && materials.length > 0,
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
    dataset,
    filters: { materials },
  } = useAppSelector(analysis);

  const colors = useColors();

  const query = useQuery(
    ['h3-data-risk', dataset, JSON.stringify(materials)],
    async () =>
      h3DataService
        .get('/risk-map', {
          params: {
            // TO-DO: replace with indicator ID
            indicatorId: '1224d1d9-c3ae-450f-acb6-67f4ed33b5f7',
            // TO-DO: replace with material ID
            materialId: 'bb5f553a-7056-4efa-995e-546bc7e458a6',
            resolution: 4,
            year: 2000,
          },
        })
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: dataset === 'risk' && materials.length > 0,
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
