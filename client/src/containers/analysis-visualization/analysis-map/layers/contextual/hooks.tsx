import { useMemo } from 'react';
import { H3HexagonLayer, H3HexagonLayerProps } from '@deck.gl/geo-layers/typed';

import { useAppSelector } from 'store/hooks';
import { analysisMap } from 'store/features/analysis';
import { MapboxLayerProps } from 'components/map/layers/types';
import { useAllContextualLayersData } from 'hooks/h3-data/contextual';
import DeckLayer from 'components/map/layers/deck';

import type { LayerProps, LayerSettings } from 'components/map/layers/types';
import type { Layer } from 'types';

export const ContextualDeckLayer = ({
  id,
  beforeId,
  zIndex,
  ...props
}: {
  id: Layer['id'];
  beforeId: LayerProps<LayerSettings>['beforeId'];
  zIndex: LayerProps<LayerSettings>['zIndex'];
} & LayerProps<LayerSettings>['settings']) => {
  const { onHoverLayer } = props;
  const { layerDeckGLProps, layers: layersMetadata } = useAppSelector(analysisMap);
  const _id = id.split('-layer')[0];

  const contextualData = useAllContextualLayersData();
  const data = useMemo(() => {
    const contextualDataById = Object.fromEntries(
      contextualData
        .filter((d) => {
          return d.isSuccess && layersMetadata[_id].visible;
        })
        .map(({ data: { layerId, ...rest } }) => [layerId, rest]),
    );

    return contextualDataById[_id]?.data || [];
  }, [contextualData, _id, layersMetadata]);
  const settings = useMemo(() => layerDeckGLProps[id] || {}, [layerDeckGLProps, id]);

  const metadata = useMemo(
    () => ({ layerId: id, ...layersMetadata[_id]['metadata'] }),
    [layersMetadata, id, _id],
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

  return (
    <DeckLayer<H3HexagonLayerProps<(typeof layer.data)[0]>>
      {...layer}
      id={id}
      beforeId={beforeId}
      zIndex={zIndex}
    />
  );
};
