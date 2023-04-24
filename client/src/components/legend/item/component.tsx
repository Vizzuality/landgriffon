import { useState, useCallback } from 'react';
import classNames from 'classnames';
import { EyeIcon, EyeOffIcon, XIcon } from '@heroicons/react/solid';
import { InformationCircleIcon as Outline } from '@heroicons/react/outline';

import OpacityControl from './opacityControl';
import DragHandle from './dragHandle';
import { ComparisonToggle } from './comparisonModeToggle';

import Modal from 'components/modal';
import Loading from 'components/loading';
import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis';

import type { Indicator, Layer, Material } from 'types';
import type { Dispatch } from 'react';

export type LegendItemProps = {
  name: string;
  metadata: Layer['metadata'] | Indicator['metadata'] | Material['metadata'];
  unit?: string;
  isLoading?: boolean;
  showToolbar?: boolean;
  children?: React.ReactNode;
  opacity: number;
  onChangeOpacity: Dispatch<number>;
  main?: boolean;
  showComparisonModeToggle?: boolean;
  onToggle: Dispatch<boolean>;
  onHideLayer?: () => void;
  isActive: boolean;
};

export const LegendItem = ({
  name,
  metadata,
  unit,
  isLoading = false,
  showToolbar = true,
  children,
  opacity,
  onChangeOpacity,
  main = false,
  showComparisonModeToggle = false,
  onHideLayer,
  onToggle,
  isActive,
}: LegendItemProps) => {
  const { isComparisonEnabled } = useAppSelector(scenarios);
  const [layerInfoVisibility, setLayerInfoVisibility] = useState(false);

  const showLayerInfo = useCallback(() => {
    setLayerInfoVisibility(true);
  }, []);

  const dismissLayerInfo = useCallback(() => {
    setLayerInfoVisibility(false);
  }, []);

  const handleToggleActive = useCallback(() => {
    onToggle(!isActive);
  }, [isActive, onToggle]);

  return (
    <>
      <div
        className={classNames('flex flex-row gap-1 relative group py-3 pl-1 pr-2', {
          'bg-gray-50': !main,
        })}
      >
        <DragHandle className="invisible group-hover:visible" />
        <div className="flex-grow min-w-0 space-y-2">
          {isLoading && (
            <div className="flex justify-center w-full align-center">
              <Loading />
            </div>
          )}
          {name && (
            <div
              className={classNames('flex items-start justify-between flex-grow', {
                hidden: isLoading,
              })}
            >
              <div className="flex-grow max-w-full min-w-0 text-sm text-left">{name}</div>
              {showToolbar && (
                <div className="flex flex-row items-center">
                  <div className="flex items-center gap-x-1 mt-0.5">
                    <OpacityControl opacity={opacity} onChange={onChangeOpacity} />
                    {/* {info && <InfoToolTip icon="outline" info={info} />} */}
                    <button type="button" onClick={showLayerInfo}>
                      <Outline className="w-4 h-4 text-gray-900" />
                    </button>
                    <button type="button" onClick={handleToggleActive}>
                      {isActive ? (
                        <EyeOffIcon className="w-4 h-4"></EyeOffIcon>
                      ) : (
                        <EyeIcon className="w-4 h-4"></EyeIcon>
                      )}
                    </button>
                    {onHideLayer && (
                      <button type="button" onClick={onHideLayer}>
                        <XIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {!isLoading && (
            <div className="space-y-2 overflow-hidden">
              {showComparisonModeToggle && isComparisonEnabled && <ComparisonToggle />}
              {children && (
                <div className="flex flex-row justify-between w-full gap-2 text-gray-500">
                  <div className="flex-grow">{children}</div>
                  <div className="-mt-0.5 px text-2xs">{unit && `(${unit})`}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Modal
        size="narrow"
        title={metadata?.name}
        open={layerInfoVisibility}
        onDismiss={dismissLayerInfo}
      >
        {/* // TODO: content to define */}
        {metadata?.description}
      </Modal>
    </>
  );
};

export default LegendItem;
