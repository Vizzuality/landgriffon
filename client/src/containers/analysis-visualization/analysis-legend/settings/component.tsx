import classNames from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { EyeIcon } from '@heroicons/react/solid';

import PreviewMap from './previewMap';
import MaterialSettings from './materialSettings';
import TogglePreview from './togglePreview';

import Accordion from 'components/accordion';
import { Button } from 'components/button';
import InfoToolTip from 'components/info-tooltip';
import Search from 'components/search';
import Toggle from 'components/toggle';
import useFuse from 'hooks/fuse';
import { analysisMap, setFilter, setLayer } from 'store/features/analysis';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';

import type { UseFuseOptions } from 'hooks/fuse';
import type { CategoryWithLayers } from 'hooks/layers/getContextualLayers';
import type { Dispatch } from 'react';
import type { Layer } from 'types';

interface LegendSettingsProps {
  categories: CategoryWithLayers[];
  onApply?: Dispatch<Layer[]>;
  onDismiss?: () => void;
}

interface LayerSettingsProps {
  layer: Layer;
  onChange: (id: Layer['id'], layer: Partial<Layer>) => void;
  onPreviewChange: (id: Layer['id'], active: boolean) => void;
  isPreviewActive: boolean;
}

const LayerSettings = ({
  layer,
  onChange,
  onPreviewChange,
  isPreviewActive,
}: LayerSettingsProps) => {
  const onToggleActive = useCallback(
    (active: boolean) => {
      onChange(layer.id, { active });
    },
    [layer.id, onChange],
  );

  const handlePreviewToggle = useCallback(
    (active: boolean) => {
      onPreviewChange(layer.id, active);
    },
    [layer.id, onPreviewChange],
  );

  return (
    <div className="flex flex-row justify-between gap-5 p-2 pl-8 place-items-center">
      <div className="flex-grow text-sm">{layer.metadata?.name}</div>
      <div className="flex flex-row gap-2 place-items-center">
        <InfoToolTip icon="outline" info={layer.metadata?.description} />
        <TogglePreview isPreviewActive={isPreviewActive} onPreviewChange={handlePreviewToggle} />
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
          activeLayers === 0 ? 'bg-gray-200' : 'bg-navy-400',
        )}
      >
        {activeLayers}
      </div>
    </div>
  );
};

interface CategorySettingsProps extends Pick<LayerSettingsProps, 'onPreviewChange'> {
  category: CategoryWithLayers['category'];
  layers: Layer[];
  activeLayers: number;
  onLayerStateChange: (id: Layer['id'], state: Partial<Layer>) => void;
  activePreviewLayerId?: Layer['id'];
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
  onPreviewChange,
  activePreviewLayerId,
}: CategorySettingsProps) => {
  return (
    <Accordion.Entry header={<CategoryHeader activeLayers={activeLayers} category={category} />}>
      {layers.length ? (
        layers.map((layer) => (
          <LayerSettings
            isPreviewActive={layer.id === activePreviewLayerId}
            onPreviewChange={onPreviewChange}
            onChange={onLayerStateChange}
            layer={layer}
            key={layer.id}
          />
        ))
      ) : (
        <NoMatches />
      )}
    </Accordion.Entry>
  );
};

const FUSE_OPTIONS: UseFuseOptions<CategoryWithLayers['layers'][number]> = {
  keys: ['name', 'metadata.name', 'metadata.description'],
  shouldSort: false,
  threshold: 0.3,
};

const LegendSettings = ({ categories = [], onApply, onDismiss }: LegendSettingsProps) => {
  const { materialId } = useAppSelector(analysisFilters);

  const {
    layers: { impact, ..._initialLayerState },
  } = useAppSelector(analysisMap);

  const [localLayerState, setLocalLayerState] = useState(_initialLayerState);
  const [localMaterial, setLocalMaterial] = useState(materialId);
  const [selectedLayerForPreview, setSelectedLayerForPreview] = useState<Layer['id'] | null>(null);

  const handleTogglePreview = useCallback<CategorySettingsProps['onPreviewChange']>(
    (id, active) => {
      setSelectedLayerForPreview(active ? id : null);
    },
    [],
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

    dispatch(setFilter({ id: 'materialId', value: localMaterial }));

    onApply?.(Object.values(localLayerState));
  }, [dispatch, localLayerState, localMaterial, onApply]);

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

  const contextualAccordionEntries = useMemo(
    () =>
      categories.map((cat) => (
        <CategorySettings
          activePreviewLayerId={selectedLayerForPreview}
          activeLayers={cat.layers.filter((layer) => localLayerState[layer.id].active).length}
          layers={layerStateByCategory[cat.category]}
          onLayerStateChange={handleLayerStateChange}
          onPreviewChange={handleTogglePreview}
          key={cat.category}
          category={cat.category}
        />
      )),
    [
      categories,
      handleLayerStateChange,
      handleTogglePreview,
      layerStateByCategory,
      localLayerState,
      selectedLayerForPreview,
    ],
  );

  const localSelectedLayerNumber = useMemo(
    () => Object.values(localLayerState).filter((l) => l.active).length,
    [localLayerState],
  );

  return (
    <div className="flex flex-row h-[600px]">
      <div className="flex flex-col items-stretch gap-5 p-6 w-96">
        <div className="w-full">
          <Search
            onChange={setSearchText}
            value={searchText}
            placeholder="Search layers"
            onReset={reset}
          />
        </div>
        <div className="text-sm text-right underline text-navy-400 underline-offset-[3px]">
          Selected layers ({localSelectedLayerNumber})
        </div>
        <div className="max-h-full p-0.5 overflow-y-auto flex-grow">
          <Accordion>
            <MaterialSettings
              layer={localLayerState.material}
              materialId={localMaterial}
              onChange={handleLayerStateChange}
              onChangeMaterial={setLocalMaterial}
              onPreviewChange={handleTogglePreview}
              isPreview={localLayerState.material.id === selectedLayerForPreview}
            />
            {contextualAccordionEntries}
          </Accordion>
        </div>
        <div className="flex flex-row justify-between">
          <Button variant="secondary" onClick={onDismiss}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            variant="secondary"
            className="text-navy-400 border-navy-400"
          >
            Apply
          </Button>
        </div>
      </div>
      <div className="h-full min-h-0 aspect-square">
        <div className="relative w-full h-full">
          <PreviewMap
            selectedMaterialId={localMaterial}
            selectedLayerId={selectedLayerForPreview}
          />
          <div className="absolute flex flex-row text-sm text-white bg-black rounded-md top-3 left-3 h-fit">
            <div className="p-3 font-bold">Preview layers</div>
            {!selectedLayerForPreview && (
              <>
                <div className="bg-white w-0.5 self-stretch" />
                <div className="p-3">
                  Click the eye icon <EyeIcon className="inline w-4 h-4" /> next to the layer name
                  to preview
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegendSettings;
