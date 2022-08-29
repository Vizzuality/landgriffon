import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisMap } from 'store/features/analysis/map';

import { useH3ContextualData } from 'hooks/h3-data';
import type { Layer } from 'types';
import { setLayer } from 'store/features/analysis';

export const useContextualLayer = (id: Layer['id']) => {
  const dispatch = useAppDispatch();
  const {
    layers: { [id]: layerInfo },
  } = useAppSelector(analysisMap);

  const query = useH3ContextualData(id, {
    enabled: layerInfo.active,
    onSuccess: () => {
      dispatch(
        setLayer({
          id: layerInfo.id,
          layer: {
            id: layerInfo.id,
            opacity: layerInfo.opacity,
            active: layerInfo.active,
          },
        }),
      );
    },
  });

  return query;
};
