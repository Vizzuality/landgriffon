import { useMemo } from 'react';

import { getTiler } from './utils';

import type { AnyLayer, AnySourceData } from 'mapbox-gl';
import type { LayerSettings, LayerProps } from 'components/map/layers/types';

export function useSource({
  id,
  tilerUrl,
  defaultTilerParams,
}: LayerProps<LayerSettings>): AnySourceData {
  const tiler = useMemo(
    () => getTiler(tilerUrl, defaultTilerParams),
    [tilerUrl, defaultTilerParams],
  );

  return {
    id: `${id}-source`,
    type: 'raster',
    tiles: [tiler],
  };
}

export function useLayer({ id, settings = {} }: LayerProps<LayerSettings>): AnyLayer {
  const visibility = settings.visibility ?? true;
  const layer = useMemo<AnyLayer>(() => {
    return {
      id,
      type: 'raster',
      paint: {
        'raster-opacity': settings.opacity ?? 1,
      },
      layout: {
        visibility: visibility ? 'visible' : 'none',
      },
    } satisfies AnyLayer;
  }, [id, settings, visibility]);

  return layer;
}
