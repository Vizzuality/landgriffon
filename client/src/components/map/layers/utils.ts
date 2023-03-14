import ImpactLayer from 'containers/analysis-visualization/analysis-map/layers/impact';
import MaterialLayer from 'containers/analysis-visualization/analysis-map/layers/material';
import ContextuaLayer from 'containers/analysis-visualization/analysis-map/layers/contextual';

import type { Layer } from 'types';

type LayerConstructor = typeof ImpactLayer | typeof MaterialLayer | typeof ContextuaLayer;

export const getLayerConfig = (layerConfig: Layer): LayerConstructor | Error => {
  const { id, isContextual } = layerConfig;

  if (id === 'impact') return ImpactLayer;
  if (id === 'material') return MaterialLayer;
  if (isContextual) return ContextuaLayer;

  return new Error(`layer ${id} could not be categorized. Please, review its configuration`);
};
