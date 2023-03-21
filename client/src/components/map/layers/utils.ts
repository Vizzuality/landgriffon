import ImpactLayer from 'containers/analysis-visualization/analysis-map/layers/impact';
import MaterialLayer from 'containers/analysis-visualization/analysis-map/layers/material';
import ContextualLayer from 'containers/analysis-visualization/analysis-map/layers/contextual';

import type { Layer } from 'types';

export type LayerConstructor = typeof ImpactLayer | typeof MaterialLayer | typeof ContextualLayer;

export const getLayerConfig = (layerConfig: Layer): LayerConstructor | null => {
  const { id, isContextual } = layerConfig;

  if (id === 'impact') return ImpactLayer;
  if (id === 'material') return MaterialLayer;
  if (isContextual) return ContextualLayer;

  return null;
};
