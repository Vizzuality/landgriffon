import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';
import { analysisMap, setLayer, setLayerDeckGLProps } from 'store/features/analysis/map';

import { useH3ImpactData } from 'hooks/h3-data';

import { NUMBER_FORMAT } from 'utils/number-format';
import { COLOR_RAMPS } from 'utils/colors';

import type { LegendItem as LegendItemProp } from 'types';
import { scenarios } from 'store/features/analysis';
import { ACTUAL_DATA } from 'containers/scenarios/constants';

const LAYER_ID = 'impact'; // should match with redux

export const useImpactLayer = () => {
  const dispatch = useAppDispatch();
  const { indicator, startYear } = useAppSelector(analysisFilters);
  const { currentScenario: scenarioId } = useAppSelector(scenarios);
  const {
    layers: { [LAYER_ID]: impactLayer },
  } = useAppSelector(analysisMap);

  const query = useH3ImpactData({
    scenarioId: scenarioId === ACTUAL_DATA.id ? undefined : scenarioId,
  });
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
                name: `${indicator.label} in ${startYear}`,
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
  }, [data, isSuccess, dispatch, indicator, query.isFetching, startYear]);

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
