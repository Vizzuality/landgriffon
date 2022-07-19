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
import type { Layer } from 'types';

export const useContextualLayer: (id: Layer['id']) => ReturnType<typeof useH3ContextualData> & {
  layer: H3HexagonLayer;
} = (id) => {
  const dispatch = useAppDispatch();
  const {
    layers: { [id]: layerInfo },
  } = useAppSelector(analysisMap);

  const query = useH3ContextualData(id, {}, { enabled: layerInfo.active });
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
          id,
          name: layerInfo.metadata.name,
          value: object?.v,
          unit: layerInfo.metadata.legend.unit,
        }),
      );
    },
    [dispatch, id, layerInfo.metadata.legend.unit, layerInfo.metadata.name],
  );

  const layer = new H3HexagonLayer({
    id,
    data: data.data,
    wireframe: false,
    filled: true,
    stroked: true,
    extruded: false,
    highPrecision: 'auto',
    pickable: true,
    coverage: 0.9,
    lineWidthMinPixels: 2,
    opacity: layerInfo.opacity,
    visible: layerInfo.active,
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
          id,
          layer: {
            loading: isFetching,
          },
        }),
      );
    }
    if (data && isFetched) {
      dispatch(
        setLayer({
          id,
          layer: {
            loading: isFetching,
          },
        }),
      );
    }
  }, [data, isFetched, dispatch, isFetching, id]);

  return {
    ...query,
    layer,
  };
};
