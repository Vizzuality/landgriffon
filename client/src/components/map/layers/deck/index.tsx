import { useEffect } from 'react';
import { Layer } from 'react-map-gl';

import { useMapboxOverlayContext } from 'components/map/layer-manager/provider';

import type { LayerSettings, DeckLayerProps } from '../types';

const DeckLayer = <T,>({
  id,
  settings,
  zIndex,
  beforeId,
  ...props
}: DeckLayerProps<T, LayerSettings>) => {
  const i = `${id}-deck`;
  const { addLayer, removeLayer } = useMapboxOverlayContext();

  useEffect(() => {
    addLayer({ ...props, id: i, beforeId });
  }, [i, beforeId, props, addLayer]);

  useEffect(() => {
    return () => {
      removeLayer(id);
    };
  }, [id, removeLayer]);

  return (
    <Layer
      id={id}
      type="background"
      paint={{
        'background-color': '#77CCFF',
        'background-opacity': 0,
      }}
      beforeId={beforeId}
    />
  );
};

export default DeckLayer;
