import { useMemo } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';

import chroma from 'chroma-js';

import store from 'store';
import { filtersForTabularAPI } from 'store/features/analysis/selector';
import { apiRawService } from 'services/api';
import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';

import type { RGBColor } from 'types';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: {
    data: [],
    metadata: {
      unit: null,
    },
  },
  retry: false,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
};
const COLOR_SCALE = chroma.scale(['#8DD3C7', '#BEBADA', '#FDB462']);

export function useColors(): RGBColor[] {
  const { layer } = useAppSelector(analysis);
  const colors = useMemo(() => COLOR_SCALE[layer].map((color) => chroma(color).rgb()), [layer]);
  return colors;
}

type ImpactDataResponse = UseQueryResult<unknown, unknown>;

export function useImpactData(): ImpactDataResponse {
  const { layer } = useAppSelector(analysis);
  const filters = filtersForTabularAPI(store.getState());
  const isEnable = !!filters?.indicatorId;

  // const colors = useColors();

  const query = useQuery(
    ['impact-data', layer, JSON.stringify({ layer, ...filters })],
    async () =>
      apiRawService
        .get('/impact/table', {
          params: {
            indicatorIds: [filters.indicatorId],
            startYear: filters.startYear,
            endYear: filters.endYear,
            groupBy: filters.groupBy,
          },
        })
        // Adding color to the response
        .then((response) => response.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: layer === 'impact' && isEnable,
    },
  );

  const { data, isError } = query;

  return useMemo(
    () =>
      ({
        ...query,
        data: (isError ? DEFAULT_QUERY_OPTIONS.placeholderData : data),
    }),
    [query, isError, data],
  );
}
