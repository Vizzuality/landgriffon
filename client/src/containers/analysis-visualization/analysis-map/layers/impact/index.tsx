import { useLayer } from './hooks';

import DeckLayer from 'components/map/layers/deck';

import type { H3HexagonLayerProps } from '@deck.gl/geo-layers/typed';
import type { LayerSettings, LayerProps } from 'components/map/layers/types';

const ImpactLayer = ({ id, beforeId, zIndex }: LayerProps<LayerSettings>) => {
  const LAYER = useLayer();

  if (!LAYER) return null;

  return <DeckLayer<H3HexagonLayerProps> {...LAYER} id={id} beforeId={beforeId} zIndex={zIndex} />;
};

export default ImpactLayer;
