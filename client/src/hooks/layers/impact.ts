import { useEffect, useMemo } from 'react';
import { omit } from 'lodash-es';
import { useSearchParams } from 'next/navigation';

import { useIndicator } from '../indicators';

import { useAppDispatch, useAppSelector, useSyncIndicators } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';
import { analysisMap, setLayer, setLayerDeckGLProps } from 'store/features/analysis/map';
import { formatNumber } from 'utils/number-format';
import { COLOR_RAMPS } from 'utils/colors';
import useH3ImpactData from 'hooks/h3-data/impact';
import useH3ComparisonData from 'hooks/h3-data/impact/comparison';
import { scenarios } from 'store/features/analysis';
import { storeToQueryParams } from 'hooks/h3-data/utils';

import type { LegendItem as LegendItemProp } from 'types';

export const useImpactLayer = () => {
  const searchParams = useSearchParams();
  const compareScenarioId = searchParams.get('compareScenarioId');
  const scenarioId = searchParams.get('scenarioId');
  const isComparisonEnabled = Boolean(compareScenarioId);

  const dispatch = useAppDispatch();
  const filters = useAppSelector(analysisFilters);
  const { comparisonMode } = useAppSelector(scenarios);
  const colorKey = isComparisonEnabled ? 'compare' : 'impact';
  const [syncedIndicators] = useSyncIndicators();

  const {
    layers: { impact: impactLayer },
  } = useAppSelector(analysisMap);

  const params = useMemo(
    () =>
      storeToQueryParams({
        ...filters,
        indicators: syncedIndicators?.[0] ? [syncedIndicators?.[0]] : undefined,
        currentScenario: scenarioId,
        scenarioToCompare: compareScenarioId,
      }),
    [compareScenarioId, filters, scenarioId, syncedIndicators],
  );

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

  const { data: indicator } = useIndicator(syncedIndicators?.[0], {
    enabled: Boolean(syncedIndicators?.[0]),
  });

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
                id: `impact-${indicator.id}-${isComparisonEnabled || 'compare'}`,
                type: 'basic',
                name: `${indicator?.metadata?.short_name} in ${year}`,
                unit: data.metadata.unit,
                min: !!data.metadata.quantiles.length && formatNumber(data.metadata.quantiles[0]),
                items: data.metadata.quantiles
                  .sort((a, b) => a - b) // always sort quantiles
                  .slice(1)
                  .map(
                    (v, index): LegendItemProp => ({
                      value: formatNumber(v),
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
