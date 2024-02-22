import { useMemo } from 'react';

import { getTiler } from './utils';

import type { RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl';
import type { LayerSettings, LayerProps } from 'components/map/layers/types';

export function useSource({
  // id,
  tilerUrl,
  defaultTilerParams,
}: LayerProps<LayerSettings>): RasterSourceSpecification {
  const tiler = useMemo(
    () => getTiler(tilerUrl, defaultTilerParams),
    [tilerUrl, defaultTilerParams],
  );

  return {
    // id: `${id}-source`,
    type: 'raster',
    tiles: [tiler],
  };
}

export function useLayer({
  id,
  settings = {},
}: LayerProps<LayerSettings>): RasterLayerSpecification {
  const visibility = settings.visibility ?? true;
  const layer = useMemo<RasterLayerSpecification>((): RasterLayerSpecification => {
    return {
      id,
      type: 'raster',
      source: `${id}-source`,
      paint: {
        'raster-opacity': settings.opacity ?? 1,
      },
      layout: {
        visibility: visibility ? 'visible' : 'none',
      },
    } satisfies RasterLayerSpecification;
  }, [id, settings, visibility]);

  return layer;
}
