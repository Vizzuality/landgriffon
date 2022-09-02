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
  onApply?: (layers: Layer[]) => void;
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
    <div className="flex flex-row justify-between gap-5 p-2 pl-8 place-items-center">
      <div className="flex-grow text-sm">{layer.metadata?.name}</div>
      <div className="flex flex-row gap-2 place-items-center">
        <InfoToolTip info={layer.metadata?.description} />
        <Toggle onChange={onToggleActive} active={!!layer.active} />
      </div>
    </div>
  );
};

const CategoryHeader: React.FC<{
  category: CategoryWithLayers['category'];
  activeLayers: number;
}> = ({ category, activeLayers }) => {
  return (
    <div className="flex flex-row justify-between">
      <div className="text-sm font-semibold text-gray-500">{category}</div>
      <div
        className={classNames(
          'w-4 h-4 my-auto text-xs font-semibold text-center text-white rounded-full',
          activeLayers === 0 ? 'bg-gray-200' : 'bg-primary',
        )}
      >
        <div className="my-auto -translate-y-px">{activeLayers}</div>
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
      {layers.map((layer) => (
        <LayerSettings onChange={onLayerStateChange} layer={layer} key={layer.id} />
      ))}
    </Accordion.Entry>
  );
};

const LegendSettings: React.FC<LegendSettingsProps> = ({ categories = [], onApply }) => {
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
      onApply?.(Object.values(localLayerState));
    });
  }, [dispatch, localLayerState, onApply]);

  return (
    <div className="h-[400px] flex flex-col justify-between gap-5 w-96">
      <div className="max-h-full p-0.5 overflow-y-auto">
        <Accordion>
          <>{accordionEntries}</>
        </Accordion>
      </div>

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
