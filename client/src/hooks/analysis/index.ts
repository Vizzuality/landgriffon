import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';

import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';

import chroma from 'chroma-js';

import analysisService from 'services/analysis';
import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';

import type { AnalysisChartOptions, AnalysisTableOptions } from './types';

import { DATA } from './mock';

const COLOR_SCALE = chroma.scale(['#8DD3C7', '#BEBADA', '#FDB462']);

export function useAnalysisChart(options: AnalysisChartOptions) {
  // const [session] = useSession();
  const { filters } = useAppSelector(analysis);
  const { indicator } = filters;

  // const query = useQuery(
  //   ['analysis-chart', JSON.stringify(options)],
  //   async () =>
  //     analysisService
  //       .request({
  //         method: 'GET',
  //         url: `/`,
  //         headers: {
  //           // Authorization: `Bearer ${session.accessToken}`,
  //         },
  //         params: {
  //           // include: 'scenarios,users',
  //         },
  //       })
  //       .then((response) => response.data),
  //   {
  //     keepPreviousData: true,
  //     placeholderData: {
  //       data: [],
  //     },
  //     refetchOnWindowFocus: false,
  //   },
  // );

  // const { data } = query;

  return useMemo(() => {
    const parsedData = DATA.map((d) => {
      const { id, indicator: indicatorName, children } = d;

      const years = uniq(
        flatten(
          children.map((c) => {
            return c.values.map((v) => v.year);
          }),
        ),
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
        {},
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
      console.log(indicator);
      if (typeof indicator !== undefined && indicator && indicator.label !== 'All indicators') {
        return indicator.label === d.indicator;
      }
      return true;
    });

    return {
      // ...query,
      isFetching: false,
      data: parsedData,
    };
  }, [filters, indicator]);
}

export function useAnalysisLegend(options: AnalysisChartOptions) {
  // const [session] = useSession();
  // const { filters } = useAppSelector(analysis);

  // const query = useQuery(['analysis-chart', JSON.stringify(options)], async () =>
  //   analysisService
  //     .request({
  //       method: 'GET',
  //       url: `/`,
  //       headers: {
  //         // Authorization: `Bearer ${session.accessToken}`,
  //       },
  //       params: {
  //         // include: 'scenarios,users',
  //         'filter[indicator]': indicator,
  //       },
  //     })
  //     .then((response) => response.data),
  // );

  // const { data } = query;

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
      // ...query,
      isFetching: false,
      data: parsedData,
    };
  }, []);
}

export function useAnalysisTable(options: AnalysisTableOptions) {
  const { filters } = useAppSelector(analysis);
  const { indicator } = filters;

  // const query = useQuery(
  //   ['analysis-table', JSON.stringify(options)],
  //   async () =>
  //     analysisService
  //       .request({
  //         method: 'GET',
  //         url: `/`,
  //         headers: {},
  //         params: {},
  //       })
  //       .then((response) => response.data),
  //   {
  //     keepPreviousData: true,
  //     placeholderData: {
  //       data: [],
  //     },
  //   },
  // );

  // const { data } = query;

  return useMemo(() => {
    const parsedData = DATA.map((d) => {
      const { id, indicator: indicatorName, values, children } = d;

      const parsedChildren = children.map((ch) => ({
        indicator: ch.name,
        key: ch.id,
        values: ch.values,
      }));

      return {
        key: id,
        indicator: indicatorName,
        children: parsedChildren,
        values,
        filters,
      };
    }).filter((d) => {
      // Remove this for API filters
      if (typeof indicator !== undefined && indicator.value !== 'all') {
        return indicator.value === d.key;
      }
      return true;
    });

    return {
      // ...query,
      isFetching: false,
      data: parsedData,
    };
  }, [filters, indicator]);
}

export function useIndicatorAnalysisTable(options: AnalysisTableOptions) {
  const { filters } = options;
  const { indicator } = filters;

  const query = useQuery(
    ['analysis-table-indicator', JSON.stringify(options)],
    async () =>
      analysisService
        .request({
          method: 'GET',
          url: `/`,
          headers: {},
          params: {
            'filter[indicator]': indicator,
          },
        })
        .then((response) => response.data),
    {
      keepPreviousData: true,
      placeholderData: {
        data: [],
      },
    },
  );

  const { data } = query;

  return useMemo(() => {
    const parsedData = DATA.map((d) => {
      const { id, children } = d;

      return {
        key: id,
        children,
        filters,
      };
    })
      .filter((d) => {
        // Remove this for API filters
        if (typeof indicator !== undefined && indicator !== 'all') return indicator === d.key;
        return true;
      })
      .map((item) => {
        const nestedParsedData = item.children.map((ch) => ({
          key: ch.id,
          indicator: ch.name,
          values: ch.values,
        }));
        return nestedParsedData;
      })
      .flat(1);

    return {
      ...query,
      data: parsedData,
    };
  }, [query, filters, indicator]);
}
