import { useEffect, useCallback } from 'react';
import { H3HexagonLayer } from '@deck.gl/geo-layers';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  analysisMap,
  setLayer,
  setTooltipPosition,
  setTooltipData,
} from 'store/features/analysis/map';

import { useH3ContextualData } from 'hooks/h3-data';

import { NUMBER_FORMAT } from 'utils/number-format';

import type { LegendItem as LegendItemProp } from 'types';

// const HEXAGON_HIGHLIGHT_COLOR = [0, 0, 0];
const layerID = 'water';

// layerID should match with redux
export const useWaterLayer: () => ReturnType<typeof useH3ContextualData> & {
  layer: H3HexagonLayer;
} = () => {
  const dispatch = useAppDispatch();
  const {
    layers: { water: waterLayer },
  } = useAppSelector(analysisMap);
  const params = {
    materialId: waterLayer.material && waterLayer.material.value,
  };
  const options = {
    enabled: !!(waterLayer.active && waterLayer.material),
  };
  const query = useH3ContextualData('70494f5f-cb8f-4c83-bd4e-3c1851f89727', params, options);
  const { data, isFetched, isFetching } = query;
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
          id: layerID,
          name: 'Water',
          value: object?.v,
          unit: data.metadata?.legend.unit,
        }),
      );
    },
    [data.metadata, dispatch],
  );

  const layer = new H3HexagonLayer({
    id: layerID,
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
    getLineColor: (d) => d.c,
    // getLineColor: (d) => (d.h === hoveredHexagon ? HEXAGON_HIGHLIGHT_COLOR : d.c),
    onHover: handleHover,
    // updateTriggers: {
    //   getLineColor: hoveredHexagon,
    // },
  });

  // Populating legend
  useEffect(() => {
    if (data && isFetched) {
      dispatch(
        setLayer({
          id: layerID,
          layer: {
            loading: isFetching,
            legend: {
              id: `legend-${layerID}`,
              name: data.metadata.name,
              unit: data.metadata.legend.unit,
              min: !!data.metadata.legend.min && NUMBER_FORMAT(data.metadata.legend?.min),
              items: data.metadata.legend.items.map(
                ({ color, label }): LegendItemProp => ({
                  value: label,
                  color,
                }),
              ),
            },
          },
        }),
      );
    }
  }, [data, isFetched, isFetching, dispatch]);

  return {
    ...query,
    layer,
  };
};
