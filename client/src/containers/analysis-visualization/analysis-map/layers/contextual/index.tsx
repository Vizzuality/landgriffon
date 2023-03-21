import { useLayer } from './hooks';

import DeckLayer from 'components/map/layers/deck';

import type { H3HexagonLayerProps } from '@deck.gl/geo-layers/typed';
import type { LayerSettings, LayerProps } from 'components/map/layers/types';

const ContextualLayer = ({ id, beforeId, zIndex, ...props }: LayerProps<LayerSettings>) => {
  // ? the incoming id is set by the layer manager with the format `${id}-layer`, but for fetching data purposes, we need to pass the real ID to the hook configuration
  const _id = id.split('-layer')[0];

  const LAYER = useLayer({ id: _id, ...props.settings });

  if (!LAYER) return null;

  // ? right now, all contextual layers are considered DeckGL layers, but we might need to change this in the future in the specification changes
  return <DeckLayer<H3HexagonLayerProps> {...LAYER} id={id} beforeId={beforeId} zIndex={zIndex} />;
};

export default ContextualLayer;
