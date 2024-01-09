import { useMemo } from 'react';
import { H3HexagonLayer } from '@deck.gl/geo-layers/typed';

import { useAppSelector } from 'store/hooks';
import { analysisMap } from 'store/features/analysis';
import { useAllContextualLayersData } from 'hooks/h3-data/contextual';
import DeckLayer from 'components/map/layers/deck';

import type { MapboxLayerProps, LayerProps, LayerSettings } from 'components/map/layers/types';
import type { H3HexagonLayerProps } from '@deck.gl/geo-layers/typed';
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
          return d.isSuccess;
        })
        .map(({ data: { layerId, ...rest } }) => [layerId, rest]),
    );

    return contextualDataById[_id]?.data || [];
  }, [contextualData, _id]);
  const settings = useMemo(() => layerDeckGLProps[_id] || {}, [layerDeckGLProps, _id]);

  const metadata = useMemo(
    () => ({ layerId: _id, ...layersMetadata[_id]['metadata'] }),
    [layersMetadata, _id],
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
