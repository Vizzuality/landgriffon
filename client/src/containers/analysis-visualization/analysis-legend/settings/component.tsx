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
import { analysisMap } from 'store/features/analysis';
import { useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';
import Loading from 'components/loading';
import Callout from 'components/callout';

import type { UseQueryResult } from '@tanstack/react-query';
import type { UseFuseOptions } from 'hooks/fuse';
import type { CategoryWithLayers } from 'hooks/layers/getContextualLayers';
import type { Dispatch } from 'react';
import type { Layer, Material } from 'types';
import type { AnalysisMapState } from 'store/features/analysis/map';

interface LegendSettingsProps {
  categories: CategoryWithLayers[];
  onApply?: Dispatch<{ layers: Layer[]; material: Material['id'] }>;
  onDismiss?: () => void;
}

type PreviewStatus = UseQueryResult['status'];

export interface LayerSettingsProps {
  layer: Layer;
  onChange: (id: Layer['id'], layer: Partial<Layer>) => void;
  onPreviewChange: (id: Layer['id'], active: boolean) => void;
  isPreviewActive: boolean;
  previewStatus: PreviewStatus;
}

const LayerSettings = ({
  layer,
  onChange,
  onPreviewChange,
  isPreviewActive,
  previewStatus,
}: LayerSettingsProps) => {
  const onToggleVisible = useCallback(
    (visible: boolean) => {
      onChange(layer.id, { visible });
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
    <div className="p-2 pl-8" data-testid={`layer-settings-item-${layer.metadata?.name}`}>
      <div className="flex flex-row justify-between gap-5 place-items-center">
        <div className="flex-grow text-sm">{layer.metadata?.name}</div>
        <div className="flex flex-row gap-2 place-items-center">
          <InfoToolTip icon="solid" info={layer.metadata?.description} />
          {previewStatus === 'loading' && isPreviewActive ? (
            <Loading />
          ) : (
            <TogglePreview
              isPreviewActive={isPreviewActive}
              onPreviewChange={handlePreviewToggle}
            />
          )}
          <Toggle onChange={onToggleVisible} active={!!layer.visible} />
        </div>
      </div>
      <div>
        {previewStatus === 'error' && isPreviewActive && (
          <Callout type="error">
            <p>Something went wrong while loading this layer.</p>
            <p>Please refresh and try again later.</p>
          </Callout>
        )}
      </div>
    </div>
  );
};

const CategoryHeader: React.FC<{
  category: CategoryWithLayers['category'];
  visibleLayers: number;
}> = ({ category, visibleLayers }) => {
  return (
    <div className="flex flex-row justify-between" data-testid={`category-header-${category}`}>
      <div className="text-sm font-semibold text-gray-500">{category}</div>
      <div
        className={classNames(
          'w-4 h-4 my-auto text-xs font-semibold text-center text-white rounded-full',
          visibleLayers === 0 ? 'bg-gray-200' : 'bg-navy-400',
        )}
      >
        {visibleLayers}
      </div>
    </div>
  );
};

interface CategorySettingsProps
  extends Pick<LayerSettingsProps, 'onPreviewChange' | 'previewStatus'> {
  category: CategoryWithLayers['category'];
  layers: Layer[];
  onLayerStateChange: (id: Layer['id'], state: Partial<Layer>) => void;
  visibleLayers: number;
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
  visibleLayers,
  activePreviewLayerId,
  ...rest
}: CategorySettingsProps) => {
  return (
    <Accordion.Entry header={<CategoryHeader visibleLayers={visibleLayers} category={category} />}>
      {layers.length ? (
        layers.map((layer) => (
          <LayerSettings
            isPreviewActive={layer.id === activePreviewLayerId}
            onChange={onLayerStateChange}
            layer={layer}
            key={layer.id}
            {...rest}
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

const LegendSettings: React.FC<LegendSettingsProps> = ({ categories = [], onApply, onDismiss }) => {
  const { materialId } = useAppSelector(analysisFilters);
  const {
    layers: { impact, ..._initialLayerState },
  }: AnalysisMapState = useAppSelector(analysisMap);

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

  const handleApply = useCallback(() => {
    onApply?.({ layers: Object.values(localLayerState), material: localMaterial });
  }, [localLayerState, localMaterial, onApply]);

  const flatLayers = useMemo(() => categories.flatMap(({ layers }) => layers), [categories]);

  const [searchText, setSearchText] = useState('');
  const result = useFuse(flatLayers, searchText, FUSE_OPTIONS);

  const reset = useCallback(() => {
    setSearchText('');
  }, []);

  const filteredLayersIds = useMemo(() => result.map((item) => item.id), [result]);

  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>('loading');

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
          previewStatus={previewStatus}
          activePreviewLayerId={selectedLayerForPreview}
          visibleLayers={cat.layers.filter((layer) => localLayerState[layer.id].visible).length}
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
      previewStatus,
      selectedLayerForPreview,
    ],
  );

  const localSelectedLayerNumber = useMemo<number>(
    () => Object.values(localLayerState).filter((l) => l.visible).length,
    [localLayerState],
  );

  return (
    <div className="flex flex-row h-[600px]">
      <div className="flex flex-col items-stretch gap-5 p-6 w-[25rem]">
        <div className="w-full">
          <Search
            onChange={setSearchText}
            value={searchText}
            placeholder="Search layers"
            onReset={reset}
          />
        </div>
        <div className="text-sm text-right text-navy-400 underline-offset-[3px]">
          Selected layers ({localSelectedLayerNumber})
        </div>
        <div className="max-h-full p-0.5 overflow-y-auto flex-grow">
          <Accordion>
            <MaterialSettings
              previewStatus={previewStatus}
              layer={localLayerState.material}
              materialId={localMaterial}
              onChange={handleLayerStateChange}
              onChangeMaterial={setLocalMaterial}
              onPreviewChange={handleTogglePreview}
              isPreviewActive={localLayerState.material.id === selectedLayerForPreview}
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
            variant="primary"
            data-testid="contextual-layer-apply-button"
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
            onStatusChange={setPreviewStatus}
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
