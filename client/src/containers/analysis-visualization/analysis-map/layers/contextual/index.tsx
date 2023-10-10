import { useMemo } from 'react';

import { ContextualDeckLayer } from './hooks';

import MapboxRasterLayer from 'components/map/layers/mapbox/raster';
import useContextualLayers from 'hooks/layers/getContextualLayers';

import type { LayerSettings, LayerProps } from 'components/map/layers/types';

const ContextualLayer = ({ id, beforeId, zIndex, settings }: LayerProps<LayerSettings>) => {
  // const { layerDeckGLProps, layers: layersMetadata } = useAppSelector(analysisMap);

  // ? the incoming id is set by the layer manager with the format `${id}-layer`, but for fetching data purposes, we need to pass the real ID to the hook configuration
  const _id = id.split('-layer')[0];

  const { data } = useContextualLayers();

  const contextualLayer = useMemo<(typeof data)[0]['layers'][0]>(() => {
    if (!data) return null;

    const allContextualLayers = data.reduce(
      (acc, value) => [...acc, ...value.layers],
      [] as (typeof data)[0]['layers'],
    );

    return allContextualLayers.find(({ id }) => _id === id) || null;
  }, [data, _id]);

  if (contextualLayer?.tilerUrl) {
    return (
      <MapboxRasterLayer
        id={id}
        beforeId={beforeId}
        settings={settings}
        tilerUrl={contextualLayer.tilerUrl}
        defaultTilerParams={contextualLayer.defaultTilerParams}
      />
    );
  }

  return <ContextualDeckLayer id={id} beforeId={beforeId} zIndex={zIndex} {...settings} />;

  // // ? data is only needed for H3 layers

  // const settings = useMemo(() => layerDeckGLProps[_id] || {}, [layerDeckGLProps, _id]);
  // const metadata = useMemo(() => layersMetadata[_id]['metadata'], [layersMetadata, _id]);

  // // ? logic to determine what type of how the layer should be rendered

  // const LAYER = useLayer({ id: _id, ...props.settings });

  // if (!LAYER) return null;

  // console.log(LAYER);

  // return null;

  // ? right now, all contextual layers are considered DeckGL layers, but we might need to change this in the future in the specification changes
  // return (
  //   <DeckLayer<H3HexagonLayerProps<(typeof LAYER.data)[0]>>
  //     {...LAYER}
  //     id={id}
  //     beforeId={beforeId}
  //     zIndex={zIndex}
  //   />
  // );
};

export default ContextualLayer;
