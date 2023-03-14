import { Layer } from 'react-map-gl';

import { useLayer } from './hooks';

import type { LayerSettings, DeckLayerProps } from '../types';

const DeckLayer = <T,>({
  id,
  settings,
  zIndex,
  beforeId,
  ...props
}: DeckLayerProps<T, LayerSettings>) => {
  useLayer({ id, beforeId, settings, zIndex, ...props });

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
