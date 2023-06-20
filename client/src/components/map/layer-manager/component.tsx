import { MapboxOverlayProvider } from './provider';

import type { Layer } from 'types';
import type { LayerSettings } from 'components/map/layers/types';
import type { LayerConstructor } from 'components/map/layers/utils';

const LayerManager = ({
  layers,
  onHoverLayer,
}: {
  layers: { id: string; layer: LayerConstructor; props?: Layer }[];
  onHoverLayer?: LayerSettings['onHoverLayer'];
}) => {
  return (
    <MapboxOverlayProvider>
      {layers.map(({ layer, id, props }, i) => {
        const LayerComponent = layer;
        // ? sets how the layers will be displayed on the map
        const beforeId = i === 0 ? 'custom-layers' : `${layers[i - 1].id}-layer`;

        return (
          <LayerComponent
            key={id}
            id={`${id}-layer`}
            beforeId={beforeId}
            zIndex={1000 - i}
            settings={{
              onHoverLayer,
              opacity: props?.opacity,
              visibility: props?.visible,
            }}
          />
        );
      })}
    </MapboxOverlayProvider>
  );
};

export default LayerManager;
