import { useCallback, useEffect, useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/outline';

import Toggle from 'components/toggle';
import Loading from 'components/loading';
import OpacityControl from './opacityControl';
import DragHandle from './dragHandle';
import Tooltip from 'components/tooltip';

export type LegendItemProps = {
  name: string | JSX.Element;
  unit: string;
  description?: string;
  active?: boolean;
  isLoading?: boolean;
  showToolbar?: boolean;
  showToggle?: boolean;
  children?: React.ReactNode;
  onActiveChange?: (active: boolean) => void;
  opacity: number;
  onChangeOpacity: (opacity: number) => void;
  legendInfo: string;
};

export const LegendItem: React.FC<LegendItemProps> = ({
  name,
  unit,
  active = false,
  isLoading = false,
  showToolbar = true,
  showToggle = true,
  children,
  onActiveChange,
  opacity,
  onChangeOpacity,
  legendInfo,
}) => {
  const [isActive, setActive] = useState<boolean>(active);
  const handleChange = useCallback(
    (active) => {
      setActive(active);
      if (onActiveChange) onActiveChange(active);
    },
    [onActiveChange],
  );

  useEffect(() => {
    setActive(active);
  }, [active]);

  return (
    <div className="p-4 space-y-4">
      {isLoading && <Loading />}
      {!isLoading && name && (
        <div className="w-full flex">
          <div className="grow flex items-start justify-between">
            <div className="max-w-[210px] text-sm text-gray-500 flex flex-row justify-start gap-x-1">
              <div>
                <DragHandle />
              </div>
              <div>{name}</div>
            </div>
            {showToolbar && (
              <div className="flex items-center">
                <div className="flex items-center space-x-1 mt-0.5">
                  <OpacityControl opacity={opacity} onChange={onChangeOpacity} />
                  <div>
                    <Tooltip
                      arrow
                      placement="top"
                      color="black"
                      content={<div className="w-56 p-2 text-left">{legendInfo}</div>}
                    >
                      <InformationCircleIcon className="w-4 h-4 text-gray-900" />
                    </Tooltip>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="ml-1 w-8">
            {showToggle && <Toggle defaultActive={isActive} onChange={handleChange} />}
          </div>
        </div>
      )}
      {!isLoading && isActive && children && (
        <div className="flex">
          <div className="flex-1">{children}</div>
          {unit && <div className="w-8 text-xs text-gray-500 -m-1">{unit}</div>}
        </div>
      )}
    </div>
  );
};

export default LegendItem;
