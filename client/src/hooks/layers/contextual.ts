import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisMap, setLayer, setLayerDeckGLProps } from 'store/features/analysis/map';

import { useH3ContextualData } from 'hooks/h3-data';
import type { Layer } from 'types';

export const useContextualLayer: (id: Layer['id']) => ReturnType<typeof useH3ContextualData> = (
  id,
) => {
  const dispatch = useAppDispatch();
  const {
    layers: { [id]: layerInfo },
  } = useAppSelector(analysisMap);

  const query = useH3ContextualData(id, { enabled: layerInfo.active });
  const { data, isFetching, isFetched } = query;

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
    if (!isFetched) return;
    dispatch(
      setLayerDeckGLProps({
        id: layerInfo.id,
        props: {
          id: layerInfo.id,
          opacity: layerInfo.opacity,
          visible: layerInfo.active,
          // data: data.data,
        },
      }),
    );
  }, [
    data.data,
    dispatch,
    isFetched,
    layerInfo.active,
    layerInfo.id,
    layerInfo.metadata.name,
    layerInfo.opacity,
  ]);

  return query;
};
