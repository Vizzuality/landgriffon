import { useMemo } from 'react';
import { H3HexagonLayer, H3HexagonLayerProps } from '@deck.gl/geo-layers/typed';

import useH3MaterialData from 'hooks/h3-data/material';
import { useAppSelector } from 'store/hooks';
import { analysisMap } from 'store/features/analysis';
import { MapboxLayerProps } from 'components/map/layers/types';

import type { LayerProps, LayerSettings } from 'components/map/layers/types';

export function useLayer(props: LayerProps<LayerSettings>['settings']) {
  const { onHoverLayer } = props;
  const { layerDeckGLProps, layers: layersMetadata } = useAppSelector(analysisMap);

  const {
    data: { data },
  } = useH3MaterialData(undefined, {
    keepPreviousData: false,
  });

  const settings = useMemo(() => layerDeckGLProps['material'] || {}, [layerDeckGLProps]);
  const metadata = useMemo(() => layersMetadata['material']['metadata'], [layersMetadata]);

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
