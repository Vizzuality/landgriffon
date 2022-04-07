import { useCallback, useEffect, useState } from 'react';
import Toggle from 'components/toggle';
import { InformationCircleIcon } from '@heroicons/react/outline';

export type LegendItemProps = {
  name: string | JSX.Element;
  unit: string;
  description?: string;
  active?: boolean;
  showToolbar?: boolean;
  showToggle?: boolean;
  children?: React.ReactNode;
  onActiveChange?: (active: boolean) => void;
};

export const LegendItem: React.FC<LegendItemProps> = ({
  name,
  unit,
  active = false,
  showToolbar = true,
  showToggle = true,
  children,
  onActiveChange,
}: LegendItemProps) => {
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
      {name && (
        <div className="flex text-sm text-gray-500 font-heading">
          <div className="flex-1 flex items-start justify-between">
            <div className="text-sm text-gray-500">{name}</div>
            {showToolbar && (
              <div className="flex items-center">
                <div className="flex-1 flex items-center space-x-1 mt-0.5">
                  <button>
                    <InformationCircleIcon className="w-4 h-4 text-gray-900" />
                  </button>
                  <button>
                    <InformationCircleIcon className="w-4 h-4 text-gray-900" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="ml-1 w-8">{showToggle && <Toggle onChange={handleChange} />}</div>
        </div>
      )}
      {isActive && children && (
        <div className="flex">
          <div className="flex-1">{children}</div>
          <div className="w-8 text-xs text-gray-500 -m-1">{unit}</div>
        </div>
      )}
    </div>
  );
};

export default LegendItem;
