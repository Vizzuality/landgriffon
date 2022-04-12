import { useEffect } from 'react';
import { H3HexagonLayer } from '@deck.gl/geo-layers';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';
import { analysisMap, setLayer } from 'store/features/analysis/map';

import { useH3ImpactData } from 'hooks/h3-data';

import { NUMBER_FORMAT } from 'utils/number-format';
import { COLOR_RAMPS } from 'utils/colors';

import type { LegendItem as LegendItemProp } from 'types';

const LAYER_ID = 'impact'; // should match with redux
const HEXAGON_HIGHLIGHT_COLOR = [0, 0, 0];

export const useImpactLayer = () => {
  const dispatch = useAppDispatch();
  const { indicator, startYear } = useAppSelector(analysisFilters);
  const {
    layers: { impact: impactLayer },
  } = useAppSelector(analysisMap);
  const query = useH3ImpactData();
  const { data } = query;

  const layer = new H3HexagonLayer({
    id: LAYER_ID,
    data: data.data,
    wireframe: false,
    filled: true,
    stroked: true,
    extruded: false,
    highPrecision: 'auto',
    pickable: true,
    coverage: 0.9,
    lineWidthMinPixels: 2,
    opacity: impactLayer.opacity,
    visible: true, // always active
    getHexagon: (d) => d.h,
    getFillColor: (d) => d.c,
    getElevation: (d) => d.v,
    getLineColor: (d) => d.c,
    // getLineColor: (d) => (d.h === hoveredHexagon ? HEXAGON_HIGHLIGHT_COLOR : d.c),
    // onHover: handleHover,
    // updateTriggers: {
    //   getLineColor: hoveredHexagon,
    // },
  });

  // Populating legend
  useEffect(() => {
    if (data && indicator) {
      dispatch(
        setLayer({
          id: LAYER_ID,
          layer: {
            loading: query.isFetching,
            legend: {
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
        }),
      );
    }
  }, [data, dispatch, indicator, query.isFetching, startYear]);

  return {
    ...query,
    layer,
  };
};
