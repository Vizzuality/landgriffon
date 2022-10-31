import { useState, useCallback, useMemo } from 'react';

import TogglePreview from './togglePreview';

import Accordion from 'components/accordion';
import InfoToolTip from 'components/info-tooltip';
import Toggle from 'components/toggle';
import ToolTip from 'components/tooltip';
import Materials from 'containers/analysis-visualization/analysis-filters/materials/component';
import { useMaterial } from 'hooks/materials';
import Loading from 'components/loading';

import type { LayerSettingsProps } from './component';
import type { SelectOption } from 'components/select';
import type { Dispatch } from 'react';
import type { Material } from 'types';

interface MaterialEntryProps extends LayerSettingsProps {
  materialId?: Material['id'];
  onChangeMaterial: Dispatch<Material['id']>;
}
const MaterialSettings = ({
  layer,
  onChangeMaterial,
  onChange,
  materialId,
  onPreviewChange,
  isPreviewActive,
  previewStatus,
}: MaterialEntryProps) => {
  const { data: material } = useMaterial(materialId);

  const [isAccordionOpen, setIsAccordionOpen] = useState(!!materialId || layer.active);

  const handleToggleActive = useCallback(
    (active: boolean) => {
      onChange?.(layer.id, { active });
      setIsAccordionOpen(true);
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
    () => (material ? { label: material.name, value: material.id } : null),
    [material],
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
      expanded={isAccordionOpen}
      onExpandedChange={setIsAccordionOpen}
      header={
        <div className="flex flex-row justify-between">
          <div className="text-sm font-semibold text-gray-500">Food and agriculture</div>
          <div className="flex flex-row place-items-center gap-2">
            <InfoToolTip icon="solid" info="TODO" />
            <div className="w-0.5 h-full bg-gray-200 rounded-full" />
            <ToolTip
              className="z-10"
              hoverTrigger
              enabled={!canPreview}
              theme="dark"
              content={
                <div className="bg-black rounded-md text-white text-sm p-2 w-36 text-center">
                  A material must be selected in order to see the preview
                </div>
              }
            >
              {isPreviewActive && previewStatus === 'loading' ? (
                <Loading />
              ) : (
                <TogglePreview
                  disabled={!canPreview}
                  isPreviewActive={isPreviewActive}
                  onPreviewChange={handleTogglePreview}
                />
              )}
            </ToolTip>

            <Toggle active={!!layer.active} onChange={handleToggleActive} />
          </div>
        </div>
      }
    >
      <div className="flex flex-row justify-between gap-5 p-2 pl-8 place-items-center max-w-full">
        <div className="flex-grow">
          <Materials current={current ?? null} onChange={handleMaterialChange} />
        </div>
      </div>
    </Accordion.Entry>
  );
};

export default MaterialSettings;
