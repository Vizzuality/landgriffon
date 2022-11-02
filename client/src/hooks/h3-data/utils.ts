import { scaleOrdinal, scaleThreshold } from 'd3-scale';

import type { UseQueryResult } from '@tanstack/react-query';
import type { ScaleOrdinal, ScaleThreshold } from 'd3-scale';
import type { AnalysisFiltersState } from 'store/features/analysis/filters';
import type { ScenariosState } from 'store/features/analysis/scenarios';
import type { H3APIResponse, H3Item, Legend, RGBColor } from 'types';

export type H3ImpactResponse = H3APIResponse & {
  metadata: {
    quantiles: number[];
    unit: string;
  };
};
export type H3DataResponse = UseQueryResult<H3APIResponse, unknown>;

type ScalesType = ScaleOrdinal<H3Item['v'], H3Item['c']> | ScaleThreshold<H3Item['v'], H3Item['c']>;

export const storeToQueryParams = ({
  startYear,
  indicator,
  materials,
  suppliers,
  origins,
  locationTypes,
  currentScenario,
}: Partial<AnalysisFiltersState & ScenariosState>) => {
  return {
    year: startYear,
    indicatorId: indicator?.value === 'all' ? null : indicator?.value,
    ...(materials?.length ? { materialIds: materials?.map(({ value }) => value) } : {}),
    ...(suppliers?.length ? { supplierIds: suppliers?.map(({ value }) => value) } : {}),
    ...(origins?.length ? { originIds: origins?.map(({ value }) => value) } : {}),
    ...(locationTypes?.length ? { locationTypes: locationTypes?.map(({ value }) => value) } : {}),
    scenarioId: currentScenario,
    resolution: origins?.length ? 6 : 4,
  };
};

export const scaleByLegendType = (
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

export const DEFAULT_QUERY_OPTIONS = {
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

export const responseParser = (response: H3APIResponse, colors: RGBColor[]): H3APIResponse => {
  const threshold = response.metadata.quantiles.sort((a, b) => a - b).slice(1, -1);
  const scale = scaleThreshold<H3Item['v'], RGBColor>().domain(threshold).range(colors);
  const h3DataWithColor = response.data.map(
    (d: H3Item): H3Item => ({
      ...d,
      c: scale(Number(d.v) as H3Item['v']),
    }),
  );
  return { ...response, data: h3DataWithColor };
};
