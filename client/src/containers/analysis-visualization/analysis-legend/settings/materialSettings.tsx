import Accordion from 'components/accordion';
import InfoToolTip from 'components/info-tooltip';
import type { SelectOption } from 'components/select';
import Toggle from 'components/toggle';
import Materials from 'containers/analysis-visualization/analysis-filters/materials/component';
import { useMaterials } from 'hooks/materials';
import type { Dispatch } from 'react';
import { useCallback } from 'react';
import { useMemo } from 'react';
import { analysisFilters } from 'store/features/analysis';
import { useAppSelector } from 'store/hooks';
import type { Layer, Material } from 'types';
import TogglePreview from './togglePreview';

interface MaterialEntryProps {
  layer: Layer;
  onChange: (id: string, layer: Partial<Layer>) => void;
  materialId?: Material['id'];
  onChangeMaterial: Dispatch<Material['id']>;
  onPreviewChange: (id: Layer['id'], active: boolean) => void;
  isPreview: boolean;
}
const MaterialSettings = ({
  layer,
  onChangeMaterial,
  onChange,
  materialId,
  onPreviewChange,
  isPreview,
}: MaterialEntryProps) => {
  const { data: materials } = useMaterials({
    select: (response) => response.data,
    placeholderData: { data: [], metadata: {} },
  });

  const { origins, suppliers, locationTypes } = useAppSelector(analysisFilters);

  const originIds = useMemo(() => origins.map(({ value }) => value), [origins]);
  const supplierIds = useMemo(() => suppliers.map(({ value }) => value), [suppliers]);
  const locationTypeIds = useMemo(() => locationTypes.map(({ value }) => value), [locationTypes]);

  const materialOptions = useMemo(
    () => materials.map((material) => ({ label: material.name, value: material.id })),
    [materials],
  );

  const handleToggleActive = useCallback(
    (active: boolean) => {
      onChange?.(layer.id, { active });
    },
    [layer.id, onChange],
  );

  const handleMaterialChange = useCallback(
    (material: SelectOption | null) => {
      onChangeMaterial(material?.value || null);
    },
    [onChangeMaterial],
  );

  const current = useMemo(
    () => materialOptions.find((material) => material.value === materialId) ?? null,
    [materialId, materialOptions],
  );

  const handleTogglePreview = useCallback(
    (active: boolean) => {
      onPreviewChange(layer.id, active);
    },
    [layer.id, onPreviewChange],
  );

  const canPreview = !!materialId;

  return (
    <Accordion.Entry
      header={
        <div className="flex flex-row justify-between">
          <div className="text-sm font-semibold text-gray-500">Food and agriculture</div>
          <div className="flex flex-row place-items-center gap-2">
            <InfoToolTip icon="outline" info="TODO" />
            <div className="w-0.5 h-full bg-gray-200 rounded-full" />
            <TogglePreview
              disabled={!canPreview}
              isPreviewActive={isPreview}
              onPreviewChange={handleTogglePreview}
            />
            <Toggle active={!!layer.active} onChange={handleToggleActive} />
          </div>
        </div>
      }
    >
      <div className="flex flex-row justify-between gap-5 p-2 pl-8 place-items-center max-w-full">
        <div className="flex-grow">
          <Materials
            current={current ?? null}
            originIds={originIds}
            supplierIds={supplierIds}
            locationTypes={locationTypeIds}
            fitContent
            withSourcingLocations
            onChange={handleMaterialChange}
          />
        </div>
      </div>
    </Accordion.Entry>
  );
};

export default MaterialSettings;
