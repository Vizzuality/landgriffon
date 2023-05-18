import React, { useCallback, useMemo, useState } from 'react';
import { EyeIcon } from '@heroicons/react/solid';

import PreviewMap from './preview-map';
import MaterialSettings from './materials';
import CategoryLayer from './categories/category-layer';
import CategoryHeader from './categories/category-header';

import Accordion from 'components/accordion';
import { Button } from 'components/button';
import Search from 'components/search';
import useFuse from 'hooks/fuse';
import { analysisMap } from 'store/features/analysis';
import { useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';

import type { UseFuseOptions } from 'hooks/fuse';
import type { CategoryWithLayers } from 'hooks/layers/getContextualLayers';
import type { Dispatch } from 'react';
import type { Layer, Material } from 'types';
import type { AnalysisMapState } from 'store/features/analysis/map';
import type {
  PreviewStatus,
  CategoryLayerProps as LayerSettingsProps,
} from './categories/category-layer/types';

interface LegendSettingsProps {
  categories: CategoryWithLayers[];
  onApply?: Dispatch<{ layers: Layer[]; material: Material['id'] }>;
  onDismiss?: () => void;
}

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
          <CategoryLayer
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

  const localSelectedLayerNumber = useMemo<number>(
    () => Object.values(localLayerState).filter((l) => l.visible).length,
    [localLayerState],
  );

  return (
    <div className="flex flex-row h-[600px] items-stretch">
      <div className="flex flex-col gap-5 p-6 w-[25rem]">
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
            {categories.map((cat) => (
              <CategorySettings
                previewStatus={previewStatus}
                activePreviewLayerId={selectedLayerForPreview}
                visibleLayers={
                  cat.layers.filter((layer) => localLayerState[layer.id].visible).length
                }
                layers={layerStateByCategory[cat.category]}
                onLayerStateChange={handleLayerStateChange}
                onPreviewChange={handleTogglePreview}
                key={cat.category}
                category={cat.category}
              />
            ))}
          </Accordion>
        </div>
        <div className="flex flex-row gap-2 justify-between">
          <Button variant="white" onClick={onDismiss}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleApply}
            variant="primary"
            data-testid="contextual-layer-apply-button"
            disabled={localSelectedLayerNumber === 0}
          >
            Apply
          </Button>
        </div>
      </div>
      <div className="relative aspect-square">
        <div className="absolute h-full w-full top-0 left-0">
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
                  preview
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
