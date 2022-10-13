import { useEffect, useMemo } from 'react';

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

const LAYER_ID = 'impact'; // should match with redux

export const useImpactLayer = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(analysisFilters);
  const { currentScenario, scenarioToCompare, isComparisonEnabled, comparisonMode } =
    useAppSelector(scenarios);

  const {
    layers: { [LAYER_ID]: impactLayer },
  } = useAppSelector(analysisMap);

  const params = useMemo(
    () =>
      storeToQueryParams({
        ...filters,
        currentScenario,
        scenarioToCompare,
        isComparisonEnabled,
      }),
    [currentScenario, filters, isComparisonEnabled, scenarioToCompare],
  );

  const { indicator } = filters;
  const { year } = params;

  const normalQuery = useH3ImpactData(params, { enabled: !isComparisonEnabled });
  const comparisonQuery = useH3ComparisonData(
    {
      ...params,
      baseScenarioId: params.scenarioId,
      comparedScenarioId: scenarioToCompare,
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
          id: LAYER_ID,
          layer: {
            loading: query.isFetching,
            metadata: {
              legend: {
                id: `${LAYER_ID}-${indicator.value}`,
                type: 'basic',
                name: `${indicator.label} in ${year}`,
                unit: data.metadata.unit,
                min: !!data.metadata.quantiles.length && NUMBER_FORMAT(data.metadata.quantiles[0]),
                items: data.metadata.quantiles.slice(1).map(
                  (v, index): LegendItemProp => ({
                    value: NUMBER_FORMAT(v),
                    color: COLOR_RAMPS[LAYER_ID][index],
                  }),
                ),
              },
            },
          },
        }),
      );
    }
  }, [data, isSuccess, dispatch, indicator, query.isFetching, year]);

  useEffect(() => {
    if (!isFetched) return;

    dispatch(
      setLayerDeckGLProps({
        id: LAYER_ID,
        props: {
          id: LAYER_ID,
          opacity: impactLayer.opacity,
          visible: impactLayer.active,
        },
      }),
    );
  }, [dispatch, impactLayer.active, impactLayer.opacity, isFetched]);

  return query;
};
