import classNames from 'classnames';
import Accordion from 'components/accordion';
import { Button } from 'components/button';
import InfoToolTip from 'components/info-tooltip';
import Toggle from 'components/toggle';
import type { CategoryWithLayers } from 'hooks/layers/getContextualLayers';
import { useCallback, useMemo, useState } from 'react';
import { analysisMap, setLayer } from 'store/features/analysis';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import type { Layer } from 'types';

interface LegendSettingsProps {
  categories: CategoryWithLayers[];
}

interface LayerSettingsProps {
  layer: Layer;
  onChange: (id: Layer['id'], layer: Partial<Layer>) => void;
}

const LayerSettings = ({ layer, onChange }: LayerSettingsProps) => {
  const onToggleActive = useCallback(
    (active: boolean) => {
      onChange(layer.id, { active });
    },
    [layer.id, onChange],
  );

  return (
    <div className="flex flex-row justify-between">
      <div className="text-sm">{layer?.metadata?.name}</div>
      <div>
        <InfoToolTip info={layer?.metadata?.description} />
        <Toggle onChange={onToggleActive} active={!!layer.active} />
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

interface CategorySettingsProps {
  category: CategoryWithLayers['category'];
  layers: Layer[];
  onLayerStateChange: (id: Layer['id'], state: Partial<Layer>) => void;
}

const CategorySettings = ({ category, layers, onLayerStateChange }: CategorySettingsProps) => {
  const activeLayers = useMemo(() => layers.filter((layer) => !!layer.active).length, [layers]);

  return (
    <Accordion.Entry header={<CategoryHeader activeLayers={activeLayers} category={category} />}>
      <div>
        {layers.map((layer) => (
          <LayerSettings onChange={onLayerStateChange} layer={layer} key={layer.id} />
        ))}
      </div>
    </Accordion.Entry>
  );
};

const LegendSettings: React.FC<LegendSettingsProps> = ({ categories = [] }) => {
  const { layers: initialLayerState } = useAppSelector(analysisMap);

  const [localLayerState, setLocalLayerState] = useState(() => initialLayerState);

  const layerStateByCategory = useMemo(
    () =>
      Object.fromEntries(
        categories.map(({ category, layers }) => {
          return [category, layers.map(({ id }) => localLayerState[id])];
        }),
      ),
    [categories, localLayerState],
  );

  const handleLayerStateChange = useCallback<CategorySettingsProps['onLayerStateChange']>(
    (id, state) => {
      setLocalLayerState((currentState) => ({
        ...currentState,
        [id]: { ...currentState[id], ...state },
      }));
    },
    [],
  );

  const accordionEntries = useMemo(
    () =>
      categories.map((cat) => (
        <CategorySettings
          layers={layerStateByCategory[cat.category]}
          onLayerStateChange={handleLayerStateChange}
          key={cat.category}
          category={cat.category}
        />
      )),
    [categories, handleLayerStateChange, layerStateByCategory],
  );

  const dispatch = useAppDispatch();
  const handleApply = useCallback(() => {
    Object.values(localLayerState).forEach((layer) => {
      dispatch(
        setLayer({
          id: layer.id,
          layer,
        }),
      );
    });
  }, [dispatch, localLayerState]);

  return (
    <div>
      <Accordion>
        <>{accordionEntries}</>
      </Accordion>
      <div className="flex flex-row justify-between">
        <Button theme="textLight">Cancel</Button>
        <Button onClick={handleApply} theme="secondary">
          Apply
        </Button>
      </div>
    </div>
  );
};

export default LegendSettings;
