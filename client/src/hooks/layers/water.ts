import { useEffect, useCallback } from 'react';
import { H3HexagonLayer } from '@deck.gl/geo-layers';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';
import {
  analysisMap,
  setLayer,
  setTooltipPosition,
  setTooltipData,
} from 'store/features/analysis/map';

import { useH3WaterData } from 'hooks/h3-data';
// import { useYears } from 'hooks/years';

import { NUMBER_FORMAT } from 'utils/number-format';
import { COLOR_RAMPS } from 'utils/colors';

import type { LegendItem as LegendItemProp } from 'types';

const LAYER_ID = 'water'; // should match with redux
// const HEXAGON_HIGHLIGHT_COLOR = [0, 0, 0];

export const useWaterLayer: () => ReturnType<typeof useH3WaterData> & { layer: H3HexagonLayer } =
  () => {
    const dispatch = useAppDispatch();
    const { indicator } = useAppSelector(analysisFilters);
    const {
      layers: { water: waterLayer },
    } = useAppSelector(analysisMap);
    // const years = useYears('water', waterLayer.material ? [waterLayer.material] : [], indicator);
    const params = {
      // year: years.data && years.data[0],
      materialId: waterLayer.material && waterLayer.material.value,
      // indicatorId: indicator?.value,
    };
    const options = {
      enabled: !!(waterLayer.active && waterLayer.material && indicator),
    };
    const query = useH3WaterData(params, options);
    const { data } = query;
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
            name: 'Water',
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
      opacity: waterLayer.opacity,
      visible: waterLayer.active,
      getHexagon: (d) => d.h,
      getFillColor: (d) => d.c,
      getElevation: (d) => d.v,
      getLineColor: (d) => d.c,
      // getLineColor: (d) => (d.h === hoveredHexagon ? HEXAGON_HIGHLIGHT_COLOR : d.c),
      onHover: handleHover,
      // updateTriggers: {
      //   getLineColor: hoveredHexagon,
      // },
    });

    // Populating legend
    useEffect(() => {
      if (data && indicator) {
        console.log(data);
        dispatch(
          setLayer({
            id: LAYER_ID,
            layer: {
              loading: query.isFetching,
              // year: years.data && years.data[0],
              legend: {
                id: LAYER_ID,
                name: indicator.label,
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
    }, [data, dispatch, indicator, query.isFetching]);

    return {
      ...query,
      layer,
    };
  };
