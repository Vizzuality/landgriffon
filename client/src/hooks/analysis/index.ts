import { useMemo } from 'react';

import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';
import chroma from 'chroma-js';

import { useAppSelector } from 'store/hooks';
import { useImpactData } from 'hooks/impact';
import { analysisFilters } from 'store/features/analysis/filters';

import type { RGBColor } from 'types';
import type { AnalysisChart } from './types';
import type { Intervention } from './types';

const COLOR_SCALE = chroma.scale(['#8DD3C7', '#BEBADA', '#FDB462']);

export function useColors(): RGBColor[] {
  const { layer } = useAppSelector(analysisFilters);
  const colors = useMemo(() => COLOR_SCALE[layer].map((color) => chroma(color).rgb()), [layer]);
  return colors;
}

export function useAnalysisChart(): AnalysisChart {
  const filters = useAppSelector(analysisFilters);

  const {
    data: { data },
    isLoading,
  } = useImpactData();

  const parsedImpact = data?.impactTable.map((data) => ({
    id: data.indicatorId,
    indicator: data.indicatorShortName,
    values: data.yearSum,
    children: data.rows.map((row) => ({
      id: row.name,
      name: row.name,
      values: row.values,
    })),
  }));

  return useMemo(() => {
    const parsedData = parsedImpact.map((d) => {
      const { id, indicator: indicatorName, children } = d;

      const years = uniq(
        flatten(
          children.map((c) => {
            return c.values.map((v) => v.year);
          }),
        ),
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
        indicator: indicatorName,
        keys,
        values,
        filters,
      };
    });

    const allKeys = uniq(flatten(parsedData.map((p) => p.keys)));
    const colorScale = COLOR_SCALE.colors(allKeys.length);

    const legendData = allKeys.reduce(
      (acc, k, i) => [
        ...acc,
        {
          id: k,
          name: k,
          color: colorScale[i],
        },
      ],
      [],
    );

    const colors = allKeys.reduce(
      (acc, k, i) => ({
        ...acc,
        [k]: colorScale[i],
      }),
      {},
    );

    const dataWithColors = parsedData.map((d) => ({
      ...d,
      colors,
    }));

    return {
      isLoading,
      isFetching: false,
      data: dataWithColors,
      legend: legendData,
    };
  }, [filters, parsedImpact, isLoading]);
}

export function useInterventionTypes(): Intervention[] {
  return [
    {
      slug: 'new-supplier-location',
      title: 'Source from a new supplier or location',
      description:
        'Select a new location or supplier you want to source from in order to analyse changes.',
    },
    {
      slug: 'production-efficiency',
      title: 'Change production efficiency',
      description: 'Setup new impacts in order to analyse the changes.',
    },
    {
      slug: 'new-material',
      title: 'Switch to a new material',
      description: 'Select a new material you want to source from in order to analyse changes.',
    },
  ];
}
