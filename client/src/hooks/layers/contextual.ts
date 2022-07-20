import { useEffect, useCallback } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  analysisMap,
  setLayer,
  setTooltipPosition,
  setTooltipData,
  setLayerDeckGLProps,
} from 'store/features/analysis/map';

import { useH3ContextualData } from 'hooks/h3-data';
import type { Layer } from 'types';

export const useContextualLayer: (id: Layer['id']) => ReturnType<typeof useH3ContextualData> = (
  id,
) => {
  const dispatch = useAppDispatch();
  const {
    layers: { [id]: layerInfo },
  } = useAppSelector(analysisMap);

  const query = useH3ContextualData(id, {}, { enabled: layerInfo.active });
  const { data, isFetching, isFetched } = query;

  // TODO: move tthis to where the new H3Hexagon... is
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

  useEffect(() => {
    if (!layerInfo.id) return;
    dispatch(
      setLayerDeckGLProps({
        id: layerInfo.id,
        props: {
          id: `h3-${layerInfo.metadata.name}`,
          opacity: layerInfo.opacity,
          visible: layerInfo.active,
          data: data.data,
        },
      }),
    );
  }, [
    data.data,
    dispatch,
    layerInfo.active,
    layerInfo.id,
    layerInfo.metadata.name,
    layerInfo.opacity,
  ]);

  return query;
};
