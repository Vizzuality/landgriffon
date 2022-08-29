import InfoToolTip from 'components/info-tooltip';
import Toggle from 'components/toggle';
import type { CategoryWithLayers } from 'hooks/layers/getContextualLayers';
import { useCallback, useMemo, useState } from 'react';
import { analysisMap, setLayer } from 'store/features/analysis';
import { useAppDispatch, useAppSelector } from 'store/hooks';

interface LegendSettingsProps {
  categories: CategoryWithLayers[];
}

interface SettingsCategoryProps {
  category: CategoryWithLayers;
  isExpanded: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
}

interface LayerSettingsProps {
  layer: SettingsCategoryProps['category']['layers'][number];
}

const LayerSettings: React.FC<LayerSettingsProps> = ({ layer }) => {
  const layers = useAppSelector(analysisMap);
  const layerState = useMemo(() => layers.layers[layer.id], [layers.layers, layer.id]);

  const dispatch = useAppDispatch();
  const onToggleActive = useCallback(
    (active: boolean) => {
      // TODO: the fetch doesn't trigger until we exit the settings. We can leave it as-is, trigger it here or prefetch it so it's faster when going back
      dispatch(setLayer({ id: layer.id, layer: { ...layer, active } }));
    },
    [dispatch, layer],
  );

  return (
    <div className="flex flex-row justify-between">
      <div className="text-sm">{layer.metadata.name}</div>
      <div>
        <InfoToolTip info={layer.metadata.description} />
        <Toggle onChange={onToggleActive} active={layerState.active} />
      </div>
    </div>
  );
};

const SettingsCategory: React.FC<SettingsCategoryProps> = ({
  category: { category, layers },
  isExpanded,
  onExpandedChange,
}) => {
  const { layers: layersState } = useAppSelector(analysisMap);

  const activeLayersInCategory = layers.filter((layer) => layersState[layer.id].active).length;

  return (
    <div>
      {/* TODO: lacking category description? Talk with design/back */}
      <div className="text-sm font-semibold">{category}</div>
      <div>
        {layers.map((layer) => (
          <LayerSettings layer={layer} key={layer.id} />
        ))}
      </div>
    </div>
  );
};

const LegendSettings: React.FC<LegendSettingsProps> = ({ categories = [] }) => {
  const [expandedCategory, setExpandedCategory] = useState<
    LegendSettingsProps['categories'][number]['category'] | null
  >(null);
  return (
    <div>
      {categories.map((category) => (
        <SettingsCategory
          key={category.category}
          category={category}
          isExpanded={expandedCategory === category.category}
          onExpandedChange={() => setExpandedCategory(category.category)}
        />
      ))}
    </div>
  );
};

export default LegendSettings;
