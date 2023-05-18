import { useMemo } from 'react';
import { H3HexagonLayer, H3HexagonLayerProps } from '@deck.gl/geo-layers/typed';

import { useAppSelector } from 'store/hooks';
import { analysisMap } from 'store/features/analysis';
import { MapboxLayerProps } from 'components/map/layers/types';
import { useAllContextualLayersData } from 'hooks/h3-data/contextual';

import type { LayerProps, LayerSettings } from 'components/map/layers/types';
import type { Layer } from 'types';

export function useLayer({
  id,
  ...props
}: {
  id: Layer['id'];
} & LayerProps<LayerSettings>['settings']) {
  const { onHoverLayer } = props;
  const { layerDeckGLProps, layers: layersMetadata } = useAppSelector(analysisMap);

  const contextualData = useAllContextualLayersData();
  const data = useMemo(() => {
    const contextualDataById = Object.fromEntries(
      contextualData
        .filter((d) => d.isSuccess)
        .map(({ data: { layerId, ...rest } }) => [layerId, rest]),
    );

    return contextualDataById[id]?.data || [];
  }, [contextualData, id]);

  const settings = useMemo(() => layerDeckGLProps[id] || {}, [layerDeckGLProps, id]);
  const metadata = useMemo(
    () => ({ layerId: id, ...layersMetadata[id]['metadata'] }),
    [layersMetadata, id],
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
