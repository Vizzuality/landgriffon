import { useState, useCallback, useMemo } from 'react';

import TogglePreview from '../categories/category-layer/toggle-preview';

import Accordion from 'components/accordion';
import Toggle from 'components/toggle';
import ToolTip from 'components/tooltip';
import Materials from 'containers/analysis-visualization/analysis-filters/materials/component';
import { useMaterial } from 'hooks/materials';
import Loading from 'components/loading';
import InfoModal from 'components/legend/item/info-modal';

import type { CategoryLayerProps as LayerSettingsProps } from '../categories/category-layer/types';
import type { Option } from 'components/forms/select';
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
    (visible: boolean) => {
      onChange?.(layer.id, { visible });
      setIsAccordionOpen(true);
    },
    [layer.id, onChange],
  );

  const handleMaterialChange = useCallback(
    (material: Option | null) => {
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
        <div className="flex flex-row justify-between" data-testid="contextual-material-header">
          <div className="text-sm font-semibold text-gray-500">Food and agriculture</div>
          <div className="flex flex-row place-items-center gap-2">
            <InfoModal
              info={{
                description:
                  'Food and agriculture represents agricultural production and global livestock distribution for all commodities incorporated in LandGriffon.',
                source: null,
                title: 'Materials layer',
              }}
            />
            <div className="h-full w-0.5 rounded-full bg-gray-200" />
            <ToolTip
              className="z-10"
              hoverTrigger
              enabled={!canPreview}
              theme="dark"
              content={
                <div className="w-36 rounded-md bg-black p-2 text-center text-sm text-white">
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

            <Toggle active={!!layer.visible} onChange={handleToggleActive} />
          </div>
        </div>
      }
    >
      <div
        className="flex max-w-full flex-row place-items-center justify-between gap-2 p-2"
        data-testid="contextual-material-content"
      >
        <div className="h-full w-5" />
        <div className="flex-grow">
          <Materials current={current ?? null} onChange={handleMaterialChange} />
        </div>
      </div>
    </Accordion.Entry>
  );
};

export default MaterialSettings;
