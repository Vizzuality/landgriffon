import classNames from 'classnames';
import { EyeIcon, EyeOffIcon, XIcon } from '@heroicons/react/solid';
import { useCallback } from 'react';

import OpacityControl from './opacityControl';
import DragHandle from './dragHandle';
import { ComparisonToggle } from './comparisonModeToggle';
import InfoModal from './info-modal';

import Loading from 'components/loading';
import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis';

import type { Dispatch } from 'react';
import type { InfoModalProps } from './info-modal';

export type LegendItemProps = {
  name: React.ReactNode;
  info?: InfoModalProps['info'];
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
  info,
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

  const handleToggleActive = useCallback(() => {
    onToggle(!isActive);
  }, [isActive, onToggle]);

  return (
    <div
      className={classNames('group relative flex flex-row gap-1 py-3 pl-1 pr-2', {
        'bg-gray-50': !main,
      })}
    >
      <DragHandle className="invisible group-hover:visible" />
      <div className="min-w-0 flex-grow space-y-2">
        {isLoading && (
          <div className="align-center flex w-full justify-center">
            <Loading />
          </div>
        )}
        {name && (
          <div
            className={classNames('flex flex-grow items-start justify-between', {
              hidden: isLoading,
            })}
          >
            <div className="min-w-0 max-w-full flex-grow text-left text-sm">{name}</div>
            {showToolbar && (
              <div className="flex flex-row items-center">
                <div className="mt-0.5 flex items-center gap-x-1">
                  <OpacityControl opacity={opacity} onChange={onChangeOpacity} />
                  {info && <InfoModal info={info} />}
                  <button type="button" onClick={handleToggleActive}>
                    {isActive ? (
                      <EyeOffIcon className="h-4 w-4"></EyeOffIcon>
                    ) : (
                      <EyeIcon className="h-4 w-4"></EyeIcon>
                    )}
                  </button>
                  {onHideLayer && (
                    <button type="button" onClick={onHideLayer}>
                      <XIcon className="h-4 w-4" />
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
              <div className="flex w-full flex-row justify-between gap-2 text-gray-500">
                <div className="flex-grow">{children}</div>
                <div className="px -mt-0.5 text-2xs">{unit && `(${unit})`}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LegendItem;
