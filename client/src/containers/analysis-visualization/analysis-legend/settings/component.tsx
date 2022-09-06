import classNames from 'classnames';
import Accordion from 'components/accordion';
import { Button } from 'components/button';
import InfoToolTip from 'components/info-tooltip';
import Search from 'components/search';
import Toggle from 'components/toggle';
import useFuse from 'hooks/fuse';
import type { CategoryWithLayers } from 'hooks/layers/getContextualLayers';
import { useCallback, useMemo, useState } from 'react';
import { analysisMap, setLayer } from 'store/features/analysis';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import type { Layer } from 'types';
import type Fuse from 'fuse.js';

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
  activeLayers: number;
  onLayerStateChange: (id: Layer['id'], state: Partial<Layer>) => void;
}

const NoMatches = () => (
  <div className="p-2 text-sm text-gray-500">
    There are no layers matching your query for this category
  </div>
);

const CategorySettings = ({
  category,
  layers,
  onLayerStateChange,
  activeLayers,
}: CategorySettingsProps) => {
  return (
    <Accordion.Entry header={<CategoryHeader activeLayers={activeLayers} category={category} />}>
      {layers.length ? (
        layers.map((layer) => (
          <LayerSettings onChange={onLayerStateChange} layer={layer} key={layer.id} />
        ))
      ) : (
        <NoMatches />
      )}
    </Accordion.Entry>
  );
};

const FUSE_OPTIONS: Fuse.IFuseOptions<CategoryWithLayers['layers'][number]> = {
  keys: ['name', 'metadata.name', 'metadata.description'],
  shouldSort: false,
  threshold: 0.3,
};

const LegendSettings: React.FC<LegendSettingsProps> = ({ categories = [], onApply }) => {
  const {
    layers: { impact, ...initialLayerState },
  } = useAppSelector(analysisMap);

  const [localLayerState, setLocalLayerState] = useState(() => initialLayerState);

  const handleLayerStateChange = useCallback<CategorySettingsProps['onLayerStateChange']>(
    (id, state) => {
      setLocalLayerState((currentState) => ({
        ...currentState,
        [id]: { ...currentState[id], ...state },
      }));
    },
    [],
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

  const flatLayers = useMemo(() => categories.flatMap(({ layers }) => layers), [categories]);

  const {
    reset,
    result,
    search: setSearchText,
    term: searchText,
  } = useFuse(flatLayers, FUSE_OPTIONS);

  const filteredLayersIds = useMemo(() => result.map((item) => item.id), [result]);

  const layerStateByCategory = useMemo(() => {
    return Object.fromEntries(
      categories.map(({ category, layers }) => {
        return [
          category,
          layers
            .filter((layer) => filteredLayersIds.includes(layer.id))
            .map(({ id }) => localLayerState[id]),
        ];
      }),
    );
  }, [categories, filteredLayersIds, localLayerState]);

  const accordionEntries = useMemo(
    () =>
      categories.map((cat) => (
        <CategorySettings
          activeLayers={cat.layers.filter((layer) => localLayerState[layer.id].active).length}
          layers={layerStateByCategory[cat.category]}
          onLayerStateChange={handleLayerStateChange}
          key={cat.category}
          category={cat.category}
        />
      )),
    [categories, handleLayerStateChange, layerStateByCategory, localLayerState],
  );

  const localSelectedLayerNumber = useMemo(
    () => Object.values(localLayerState).filter((l) => l.active).length,
    [localLayerState],
  );

  return (
    <div className="h-[400px] w-96 flex flex-col items-stretch gap-5">
      <div className="w-full">
        <Search
          onChange={setSearchText}
          value={searchText}
          placeholder="Search layers"
          onReset={reset}
        />
      </div>
      <div className="text-sm text-right underline text-primary underline-offset-[3px]">
        Selected layers ({localSelectedLayerNumber})
      </div>
      <div className="max-h-full p-0.5 overflow-y-auto flex-grow">
        <Accordion>{accordionEntries}</Accordion>
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
