import { useMemo } from 'react';
import { H3HexagonLayer } from '@deck.gl/geo-layers/typed';

import { useImpactLayer } from 'hooks/layers/impact';
import { useAppSelector } from 'store/hooks';
import { analysisMap } from 'store/features/analysis';

import type { H3HexagonLayerProps } from '@deck.gl/geo-layers/typed';
import type { MapboxLayerProps, LayerProps, LayerSettings } from 'components/map/layers/types';

export function useLayer(props: LayerProps<LayerSettings>['settings']) {
  const { onHoverLayer } = props;
  const { layerDeckGLProps, layers: layersMetadata } = useAppSelector(analysisMap);

  const {
    data: { data },
  } = useImpactLayer();

  const settings = useMemo(() => layerDeckGLProps['impact'] || {}, [layerDeckGLProps]);
  const metadata = useMemo(
    () => ({ layerId: 'impact', ...layersMetadata['impact']['metadata'] }),
    [layersMetadata],
  );

  const layer = useMemo(() => {
    return {
      ...settings,
      type: H3HexagonLayer,
      data,
      pickable: true,
      getHexagon: (d) => d.h,
      getFillColor: (d) => d.c,
      getLineColor: (d) => d.c,
      visible: settings.visible ?? true,
      opacity: settings.opacity ?? 1,
      onHover: (pickinginfo) => {
        onHoverLayer?.(pickinginfo, metadata);
      },
    } satisfies MapboxLayerProps<H3HexagonLayerProps<(typeof data)[0]>>;
  }, [data, settings, metadata, onHoverLayer]);

  return layer;
}
