import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { omit } from 'lodash-es';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';
import { analysisMap, setLayer, setLayerDeckGLProps } from 'store/features/analysis/map';
import { NUMBER_FORMAT } from 'utils/number-format';
import { COLOR_RAMPS } from 'utils/colors';
import useH3ImpactData from 'hooks/h3-data/impact';
import useH3ComparisonData from 'hooks/h3-data/impact/comparison';
import { scenarios } from 'store/features/analysis';
import { storeToQueryParams } from 'hooks/h3-data/utils';

import type { LegendItem as LegendItemProp } from 'types';

export const useImpactLayer = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(analysisFilters);
  const {
    query: { scenarioId, compareScenarioId },
  } = useRouter();
  const isComparisonEnabled = !!compareScenarioId;
  const { comparisonMode } = useAppSelector(scenarios);
  const colorKey = !!compareScenarioId ? 'compare' : 'impact';

  const {
    layers: { impact: impactLayer },
  } = useAppSelector(analysisMap);

  const params = useMemo(
    () =>
      storeToQueryParams({
        ...filters,
        currentScenario: scenarioId as string,
        scenarioToCompare: compareScenarioId as string,
        isComparisonEnabled,
      }),
    [compareScenarioId, filters, isComparisonEnabled, scenarioId],
  );

  const { indicator } = filters;
  const { year } = params;

  const normalQuery = useH3ImpactData(params, { enabled: !isComparisonEnabled });
  const comparisonQuery = useH3ComparisonData(
    {
      ...omit(params, ['scenarioId']),
      baseScenarioId: params.scenarioId,
      comparedScenarioId: compareScenarioId as string,
      relative: comparisonMode === 'relative',
    },
    { enabled: isComparisonEnabled },
  );

  const query = isComparisonEnabled ? comparisonQuery : normalQuery;

  const { data, isSuccess, isFetched } = query;

  // Populating legend
  useEffect(() => {
    if (data && isSuccess && indicator) {
      dispatch(
        setLayer({
          id: 'impact',
          layer: {
            loading: query.isFetching,
            metadata: {
              legend: {
                id: `impact-${indicator.value}-${isComparisonEnabled || 'compare'}`,
                type: 'basic',
                name: `${indicator.label} in ${year}`,
                unit: data.metadata.unit,
                min: !!data.metadata.quantiles.length && NUMBER_FORMAT(data.metadata.quantiles[0]),
                items: data.metadata.quantiles
                  .sort((a, b) => a - b) // always sort quantiles
                  .slice(1)
                  .map(
                    (v, index): LegendItemProp => ({
                      value: NUMBER_FORMAT(v),
                      color: COLOR_RAMPS[colorKey][index],
                    }),
                  ),
              },
            },
          },
        }),
      );
    }
  }, [data, isSuccess, dispatch, indicator, query.isFetching, year, isComparisonEnabled, colorKey]);

  useEffect(() => {
    if (!isFetched) return;

    dispatch(
      setLayerDeckGLProps({
        id: 'impact',
        props: {
          id: 'impact',
          opacity: impactLayer.opacity,
          visible: impactLayer.active,
        },
      }),
    );
  }, [dispatch, impactLayer.active, impactLayer.opacity, isFetched]);

  return query;
};
