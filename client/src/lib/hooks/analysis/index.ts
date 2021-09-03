import { useMemo } from 'react';
import { useQuery } from 'react-query';
import analysisService from 'services/analysis';

import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';

import { DATA } from './mock';

interface AnalysisChartOptions {
  filters: {};
}

export function useAnalysisChart(options: AnalysisChartOptions) {
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
        },
      })
      .then((response) => response.data)
  );

  const { data } = query;

  return useMemo(() => {
    const parsedData2 = DATA.map((d) => {
      const { id, indicator, children } = d;

      const years = uniq(
        flatten(
          children.map((c) => {
            return c.values.map((v) => v.year);
          })
        )
      );

      const keys = uniq(flatten(children.map((c) => c.id)));

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
      return {
        id,
        indicator,
        keys,
        values,
        filters,
      };
    }).filter((d) => {
      if (typeof indicator !== undefined && indicator !== 'all') return indicator === d.id;
      return true;
    });

    return {
      ...query,
      data: parsedData2,
    };
  }, [query, data?.data]);
}
