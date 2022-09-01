import classNames from 'classnames';
import Accordion from 'components/accordion';
import InfoToolTip from 'components/info-tooltip';
import Toggle from 'components/toggle';
import type { CategoryWithLayers } from 'hooks/layers/getContextualLayers';
import { useCallback, useMemo } from 'react';
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
        <Toggle onChange={onToggleActive} active={layerState.active || false} />
      </div>
    </div>
  );
};

const CategoryHeader: React.FC<{
  category: CategoryWithLayers['category'];
  activeLayers?: number;
}> = ({ category, activeLayers }) => {
  return (
    <div className="flex flex-row justify-between">
      <div className="text-sm font-semibold">{category}</div>
      <div
        className={classNames(
          'w-4 h-4 my-auto text-xs font-semibold text-center text-white rounded-full bg-green-700',
        )}
      >
        {activeLayers}
      </div>
    </div>
  );
};

const CategorySettings: React.FC<{ category: CategoryWithLayers }> = ({
  category: { category, layers },
}) => {
  const { layers: layerState } = useAppSelector(analysisMap);
  const activeLayers = useMemo(
    () => layers.filter((layer) => !!layerState[layer.id].active).length,
    [layerState, layers],
  );

  return (
    <Accordion.Entry header={<CategoryHeader activeLayers={activeLayers} category={category} />}>
      asd
    </Accordion.Entry>
  );
};

const LegendSettings: React.FC<LegendSettingsProps> = ({ categories = [] }) => {
  const accordionEntries = useMemo(
    () => categories.map((cat) => <CategorySettings key={cat.category} category={cat} />),
    [categories],
  );

  return (
    <div>
      <Accordion>
        <>{accordionEntries}</>
      </Accordion>
    </div>
  );
};

export default LegendSettings;
