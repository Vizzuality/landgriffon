import { useMemo } from 'react';

import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';
import chroma from 'chroma-js';

import { useAppSelector } from 'store/hooks';
import { useImpactData } from 'hooks/impact';
import { analysis } from 'store/features/analysis';

import type { RGBColor } from 'types';
import type { AnalysisChart } from './types';

const COLOR_SCALE = chroma.scale(['#8DD3C7', '#BEBADA', '#FDB462']);

export function useColors(): RGBColor[] {
  const { layer } = useAppSelector(analysis);
  const colors = useMemo(() => COLOR_SCALE[layer].map((color) => chroma(color).rgb()), [layer]);
  return colors;
}

export function useAnalysisChart(): AnalysisChart {
  const { filters } = useAppSelector(analysis);

  const { data: impactData, isLoading } = useImpactData();
  const data = impactData?.data;

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
