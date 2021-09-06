import { useMemo } from 'react';
import { useQuery } from 'react-query';
import analysisService from 'services/analysis';

import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';

import chroma from 'chroma-js';

import { DATA } from './mock';

const COLOR_SCALE = chroma.scale(['#8DD3C7', '#BEBADA', '#FDB462']);

interface AnalysisChartOptions {
  filters: Record<string, unknown>;
}

export function useAnalysisChart(options: AnalysisChartOptions) {
  // const [session] = useSession();
  const { filters } = options;
  const { indicator } = filters;

  const query = useQuery(
    ['analysis-chart', JSON.stringify(options)],
    async () =>
      analysisService
        .request({
          method: 'GET',
          url: `/`,
          headers: {
            // Authorization: `Bearer ${session.accessToken}`,
          },
          params: {
            // include: 'scenarios,users',
          },
        })
        .then((response) => response.data),
    {
      keepPreviousData: true,
      placeholderData: {
        data: [],
      },
    }
  );

  const { data } = query;

  return useMemo(() => {
    const parsedData = DATA.map((d) => {
      const { id, indicator: indicatorName, children } = d;

      const years = uniq(
        flatten(
          children.map((c) => {
            return c.values.map((v) => v.year);
          })
        )
      );

      const keys = uniq(flatten(children.map((c) => c.id)));

      const colorScale = COLOR_SCALE.colors(keys.length);

      const values = years.map((y, i) => {
        const chs = children.reduce((acc, c) => {
          const v = c.values.find((vl) => vl.year === y);

          return {
            ...acc,
            [c.id]: v?.value,
          };
        }, {});

        const calculated = children.every((c) => {
          const v = c.values.find((vl) => vl.year === y);
          return v.calculated;
        });

        return {
          id: `${i}`,
          date: `01/01/${y}`,
          current: !calculated,
          ...chs,
        };
      });

      const colors = keys.reduce(
        (acc, k, i) => ({
          ...acc,
          [k]: colorScale[i],
        }),
        {}
      );

      return {
        id,
        indicator: indicatorName,
        keys,
        colors,
        values,
        filters,
      };
    }).filter((d) => {
      // Remove this for API filters
      if (typeof indicator !== undefined && indicator !== 'all') return indicator === d.id;
      return true;
    });

    return {
      ...query,
      data: parsedData,
    };
  }, [query, data?.data]);
}

export function useAnalysisLegend(options: AnalysisChartOptions) {
  // const [session] = useSession();
  const { filters } = options;
  const { indicator } = filters;

  const query = useQuery(['analysis-chart', JSON.stringify(options)], async () =>
    analysisService
      .request({
        method: 'GET',
        url: `/`,
        headers: {
          // Authorization: `Bearer ${session.accessToken}`,
        },
        params: {
          // include: 'scenarios,users',
          'filter[indicator]': indicator,
        },
      })
      .then((response) => response.data)
  );

  const { data } = query;

  return useMemo(() => {
    const parsedData = DATA.reduce((acc, d) => {
      const { children } = d;

      const keys = uniqBy(flatten(children.map((c) => ({ id: c.id, name: c.name }))), 'id');
      const keysUniq = uniqBy([...acc, ...keys], 'id');

      const colorScale = COLOR_SCALE.colors(keysUniq.length);

      return keysUniq.map((k, i) => ({
        ...k,
        color: colorScale[i],
      }));
    }, []);

    return {
      ...query,
      data: parsedData,
    };
  }, [query, data?.data]);
}
