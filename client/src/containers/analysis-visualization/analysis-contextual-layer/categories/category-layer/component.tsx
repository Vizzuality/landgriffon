import React, { useCallback } from 'react';

import TogglePreview from './toggle-preview';

import InfoToolTip from 'components/info-tooltip';
import Toggle from 'components/toggle';
import Loading from 'components/loading';
import Callout from 'components/callout';

import type { CategoryLayerProps } from './types';

const CategoryLayer = ({
  layer,
  onChange,
  onPreviewChange,
  isPreviewActive,
  previewStatus,
}: CategoryLayerProps) => {
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
    <div className="flex gap-2">
      <div className="w-5 h-full" />
      <div className="p-2 flex-1" data-testid={`layer-settings-item-${layer.metadata?.name}`}>
        <div className="flex flex-row justify-between gap-5 place-items-center">
          <div className="flex-grow text-sm">{layer.metadata?.name}</div>
          <div className="flex flex-row gap-2 place-items-center">
            <InfoToolTip info={layer.metadata?.description} />
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
    </div>
  );
};

export default CategoryLayer;
