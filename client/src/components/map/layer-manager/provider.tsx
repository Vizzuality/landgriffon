import { createContext, useCallback, useContext, useMemo } from 'react';
import { useControl } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox/typed';

import type { MapboxOverlayProps } from '@deck.gl/mapbox/typed';
import type { PropsWithChildren } from 'react';
import type { Layer } from 'types';
import type { LayerSettings, DeckLayerProps } from 'components/map/layers/types';

interface MapboxOverlayContext {
  addLayer: (layer: DeckLayerProps<unknown, LayerSettings>) => void;
  removeLayer: (id: Layer['id']) => void;
}

const Context = createContext<MapboxOverlayContext>({
  addLayer: () => undefined,
  removeLayer: () => undefined,
});

function useMapboxOverlay(
  props: MapboxOverlayProps & {
    interleaved?: boolean;
  },
) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);

  return overlay;
}

export const MapboxOverlayProvider = ({ children }: PropsWithChildren) => {
  const OVERLAY = useMapboxOverlay({
    interleaved: true,
  });

  const addLayer = useCallback(
    (layer) => {
      // TODO: fix this
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const layers = OVERLAY._props.layers || [];

      const l1 = new layer.type({
        ...layer,
        getPolygonOffset: () => [0, -100000000 + layer.zIndex * 1000],
      });

      OVERLAY.setProps({
        layers: [...layers.filter((l) => l.id !== layer.id), l1],
      });
    },
    [OVERLAY],
  );

  const removeLayer = useCallback(
    (id) => {
      // TODO: fix this, same as above
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const layers = OVERLAY._props.layers || [];

      OVERLAY.setProps({
        layers: [...layers.filter((l) => l.id !== id)],
      });
    },
    [OVERLAY],
  );

  const context = useMemo(
    () => ({
      addLayer,
      removeLayer,
    }),
    [addLayer, removeLayer],
  );

  return (
    <Context.Provider key="mapbox-overlay-provider" value={context}>
      {children}
    </Context.Provider>
  );
};

export const useMapboxOverlayContext = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error('useMapboxOverlayContext must be used within a MapboxOverlayProvider');
  }

  return context;
};
