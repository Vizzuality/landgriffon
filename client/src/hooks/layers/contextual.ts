import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisMap, setLayerDeckGLProps } from 'store/features/analysis/map';

import { useH3ContextualData } from 'hooks/h3-data';
import type { Layer } from 'types';

export const useContextualLayer = (id: Layer['id']) => {
  const dispatch = useAppDispatch();
  const {
    layers: { [id]: layerInfo },
  } = useAppSelector(analysisMap);

  const query = useH3ContextualData(id, {
    enabled: layerInfo.active,
    onSuccess: () => {
      dispatch(
        setLayerDeckGLProps({
          id: layerInfo.id,
          props: {
            id: layerInfo.id,
            opacity: layerInfo.opacity,
            visible: layerInfo.active,
          },
        }),
      );
    },
  });

  return query;
};
