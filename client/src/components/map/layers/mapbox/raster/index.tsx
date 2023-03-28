import { Source, Layer } from 'react-map-gl';

import { useLayer, useSource } from './hooks';

import type { LayerProps, LayerSettings } from 'components/map/layers/types';

const MapboxRasterLayer = ({ beforeId, ...props }: LayerProps<LayerSettings>) => {
  const SOURCE = useSource(props);
  const LAYER = useLayer(props);

  if (!SOURCE || !LAYER) return null;

  return (
    <Source {...SOURCE}>
      <Layer {...LAYER} beforeId={beforeId} />
    </Source>
  );
};

export default MapboxRasterLayer;
