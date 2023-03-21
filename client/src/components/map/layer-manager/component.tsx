import { MapboxOverlayProvider } from './provider';

import type { LayerSettings } from 'components/map/layers/types';
import type { LayerConstructor } from 'components/map/layers/utils';

const LayerManager = ({
  layers,
  onHoverLayer,
}: {
  layers: Record<string, LayerConstructor>;
  onHoverLayer?: LayerSettings['onHoverLayer'];
}) => {
  const LAYERS_FILTERED = Object.keys(layers).filter((layerId) => !!layers[layerId]);

  return (
    <MapboxOverlayProvider>
      {LAYERS_FILTERED.map((layerId, i) => {
        const LayerComponent = layers[layerId];
        // ? sets how the layers will be displayed on the map
        const beforeId = i === 0 ? 'custom-layers' : `${LAYERS_FILTERED[i - 1]}-layer`;

        return (
          <LayerComponent
            key={layerId}
            id={`${layerId}-layer`}
            beforeId={beforeId}
            zIndex={1000 - i}
            settings={{
              onHoverLayer,
            }}
          />
        );
      })}
    </MapboxOverlayProvider>
  );
};

export default LayerManager;
