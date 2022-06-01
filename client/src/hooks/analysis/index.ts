import { useMemo } from 'react';

import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';
import compact from 'lodash/compact';
import chroma from 'chroma-js';

import { useAppSelector } from 'store/hooks';
import { useImpactRanking } from 'hooks/impact';
import { analysisFilters } from 'store/features/analysis/filters';

import type { RGBColor } from 'types';
import type { AnalysisChart } from './types';
import type { Intervention } from './types';

const COLOR_SCALE = chroma.scale([
  '#E1E1E1',
  '#AAD463',
  '#FDB462',
  '#9CBB97',
  '#80B1D3',
  '#FB968A',
  '#BEBADA',
  '#FFFFB3',
  '#8DD3C7',
]);

export function useColors(): RGBColor[] {
  const { layer } = useAppSelector(analysisFilters);
  const colors = useMemo(() => COLOR_SCALE[layer].map((color) => chroma(color).rgb()), [layer]);
  return colors;
}

export function useAnalysisChart(params): AnalysisChart {
  const filters = useAppSelector(analysisFilters);
  const { data, isLoading } = useImpactRanking(params);

  const parsedImpact = data?.impactTable.map((data) => {
    const projectedYears = uniq(
      flatten(
        data.rows.map((row) =>
          compact(
            row.values.map((v) => {
              if (v.isProjected) {
                return v.year;
              }
            }),
          ),
        ),
      ),
    ) as number[];

    const projection = !!projectedYears.length && Math.min(...projectedYears);
    return {
      id: data.indicatorId,
      indicator: data.indicatorShortName,
      unit: data.metadata.unit,
      values: data.yearSum,
      projection,
      children: flatten([
        data.rows.map((row) => ({
          id: row.name,
          name: row.name,
          values: row.values,
        })),
        {
          id: data.others.numberOfAggregatedEntities === 1 ? 'Other' : 'Others',
          name: data.others.numberOfAggregatedEntities === 1 ? 'Other' : 'Others',
          values: data.others.aggregatedValues.map((aggregated) => ({
            ...aggregated,
            isProjected: projectedYears.includes(aggregated.year),
          })),
        },
      ]),
    };
  });
  return useMemo(() => {
    const parsedData = parsedImpact.map((d) => {
      const { id, indicator: indicatorName, children, projection, unit: indicatorUnit } = d;
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
          return v.isProjected;
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
        unit: indicatorUnit,
        indicator: indicatorName,
        projection,
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
      slug: 'NEW_SUPPLIER',
      title: 'Source from a new supplier or location',
      value: 'Source from new supplier or location',
      description:
        'Select a new location or supplier you want to source from in order to analyse changes.',
    },
    {
      slug: 'CHANGE_PRODUCTION_EFFICIENCY',
      title: 'Change production efficiency',
      value: 'Change production efficiency',
      description: 'Setup new impacts in order to analyse the changes.',
    },
    {
      slug: 'NEW_MATERIAL',
      title: 'Switch to a new material',
      value: 'Switch to a new material',
      description: 'Select a new material you want to source from in order to analyse changes.',
    },
  ];
}
