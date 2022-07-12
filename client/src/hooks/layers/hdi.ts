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

const layerID = 'hdi';

// layerID should match with redux
export const useHDILayer: () => ReturnType<typeof useH3ContextualData> & {
  layer: H3HexagonLayer;
} = () => {
  const dispatch = useAppDispatch();
  const {
    layers: { hdi: hdiLayer },
  } = useAppSelector(analysisMap);
  const options = {
    enabled: !!hdiLayer.active,
  };
  const query = useH3ContextualData('6f9bc2a8-e4e5-4c18-a615-ee8acf275c35', {}, options);
  const { data, isFetching, isFetched } = query;

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
          name: 'Human Development Index',
          value: object?.v,
          unit: data.metadata?.legend.unit,
        }),
      );
    },
    [data.metadata?.legend.unit, dispatch],
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
    opacity: hdiLayer.opacity,
    visible: hdiLayer.active,
    getHexagon: (d) => d.h,
    getFillColor: (d) => d.c,
    getLineColor: (d) => d.c,
    onHover: handleHover,
  });

  // Populating legend
  useEffect(() => {
    if (data && isFetching) {
      dispatch(
        setLayer({
          id: layerID,
          layer: {
            loading: isFetching,
          },
        }),
      );
    }
    if (data && isFetched) {
      dispatch(
        setLayer({
          id: layerID,
          layer: {
            loading: isFetching,
            legend: {
              id: `legend-${layerID}`,
              name: data.metadata.name,
              description: data.metadata.description,
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
  }, [data, isFetched, dispatch, isFetching]);

  return {
    ...query,
    layer,
  };
};
