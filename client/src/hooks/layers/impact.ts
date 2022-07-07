import { useCallback, useEffect } from 'react';
import { H3HexagonLayer } from '@deck.gl/geo-layers';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';
import {
  analysisMap,
  setLayer,
  setTooltipData,
  setTooltipPosition,
} from 'store/features/analysis/map';

import { useH3ImpactData } from 'hooks/h3-data';

import { NUMBER_FORMAT } from 'utils/number-format';
import { COLOR_RAMPS } from 'utils/colors';

import type { LegendItem as LegendItemProp } from 'types';

const LAYER_ID = 'impact'; // should match with redux
// const HEXAGON_HIGHLIGHT_COLOR = [0, 0, 0];

export const useImpactLayer: () => ReturnType<typeof useH3ImpactData> & { layer: H3HexagonLayer } =
  () => {
    const dispatch = useAppDispatch();
    const { indicator, startYear } = useAppSelector(analysisFilters);
    const {
      layers: { impact: impactLayer },
    } = useAppSelector(analysisMap);
    const query = useH3ImpactData();
    const { data, isSuccess } = query;

    const handleHover = useCallback(
      ({ object, x, y, viewport }) => {
        dispatch(
          setTooltipPosition({
            x,
            y,
            viewport: viewport ? { width: viewport.width, height: viewport.height } : null,
          }),
        );
        dispatch(
          setTooltipData({
            id: LAYER_ID,
            name: 'Impact',
            value: object?.v,
            unit: data.metadata?.unit,
          }),
        );
      },
      [data.metadata?.unit, dispatch],
    );

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
      visible: impactLayer.active,
      getHexagon: (d) => d.h,
      getFillColor: (d) => d.c,
      getLineColor: (d) => d.c,
      // getLineColor: (d) => (d.h === hoveredHexagon ? HEXAGON_HIGHLIGHT_COLOR : d.c),
      onHover: handleHover,
      // updateTriggers: {
      //   getLineColor: hoveredHexagon,
      // },
    });

    // Populating legend
    useEffect(() => {
      if (data && isSuccess && indicator) {
        dispatch(
          setLayer({
            id: LAYER_ID,
            layer: {
              loading: query.isFetching,
              legend: {
                id: `${LAYER_ID}-${indicator.value}`,
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
    }, [data, isSuccess, dispatch, indicator, query.isFetching, startYear]);

    return {
      ...query,
      layer,
    };
  };
