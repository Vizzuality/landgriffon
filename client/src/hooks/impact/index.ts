import { useMemo } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';

import chroma from 'chroma-js';

import store from 'store';
import { filtersForTabularAPI } from 'store/features/analysis/selector';
import { apiRawService } from 'services/api';
import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';
import { useIndicators } from 'hooks/indicators';

import type { RGBColor } from 'types';

const DEFAULT_QUERY_OPTIONS: UseQueryOptions = {
  placeholderData: {
    data: {
      impactTable: [],
      purchasedTonnes: [],
    },
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

type ImpactData = {
  data: {
    impactTable: {
      groupBy: string;
      indicatorId: string;
      indicatorShortName: string;
      metadata: Record<string, unknown>;
      rows: {
        name: string;
        values: Record<string, number | string | boolean>[];
      }[];
      yearSum: {
        year: number;
        value: number;
      }[];
    }[];
  };
  metadata: Record<string, unknown>;
};

type ImpactDataResponse = UseQueryResult<ImpactData, unknown>;

export function useImpactData(): ImpactDataResponse {
  const { data: indicators } = useIndicators();
  const { layer } = useAppSelector(analysis);
  const filters = filtersForTabularAPI(store.getState());
  const isEnable = !!filters?.indicatorId && !!indicators?.length;

  const indicatorIds = indicators.map(({ id }) => id);

  const query = useQuery(
    ['impact-data', layer, JSON.stringify({ layer, ...filters, indicatorIds })],
    async () =>
      apiRawService
        .get('/impact/table', {
          params: {
            indicatorIds: filters.indicatorId === 'all' ? indicatorIds : [filters.indicatorId],
            startYear: filters.startYear,
            endYear: filters.endYear,
            groupBy: filters.groupBy,
          },
        })
        .then((response) => response.data),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: layer === 'impact' && isEnable,
    },
  );

  const { data, isError } = query;

  return useMemo<ImpactDataResponse>(
    () =>
      ({
        ...query,
        data: (isError ? DEFAULT_QUERY_OPTIONS.placeholderData : data) as ImpactData,
      } as ImpactDataResponse),
    [query, isError, data],
  );
}
