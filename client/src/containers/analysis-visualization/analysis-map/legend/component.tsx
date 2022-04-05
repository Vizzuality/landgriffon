import { useCallback, useState } from 'react';
import cx from 'classnames';
import { InformationCircleIcon } from '@heroicons/react/outline';

import Toggle from 'components/toggle';

export interface LegendProps {
  className?: string;
  children: React.ReactNode;
}

export const Legend: React.FC<LegendProps> = ({ children, className = '' }: LegendProps) => {
  const [active, setActive] = useState(false);

  const onToggleActive = useCallback(() => {
    setActive(!active);
  }, [active]);

  return (
    <div
      className={cx('flex flex-col flex-grow shadow-sm bg-white border border-gray-200 rounded', {
        [className]: !!className,
      })}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="font-semibold text-gray-900 text-sm">Legend</div>
        <button
          type="button"
          aria-expanded={active}
          className="text-green-700 text-xs"
          onClick={onToggleActive}
        >
          <span>{active ? 'Hide' : 'Show'} contextual layers</span>
        </button>
      </div>

      {/* Contextual layers */}
      {active && (
        <div className="relative flex flex-col flex-grow">
          <div className="flex justify-between items-center px-4 py-2 border-t border-gray-100">
            <div className="text-sm text-gray-500">Material</div>
            <div className="flex items-center">
              <div className="flex-1 flex items-center space-x-1">
                <button>
                  <InformationCircleIcon className="w-4 h-4 text-gray-900" />
                </button>
                <button>
                  <InformationCircleIcon className="w-4 h-4 text-gray-900" />
                </button>
              </div>
              <div className="ml-1 w-8 flex justify-end">
                <Toggle />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center px-4 py-2 border-t border-gray-100">
            <div className="text-sm text-gray-500">Risk</div>
            <div className="flex items-center">
              <div className="flex-1 flex items-center space-x-1">
                <button>
                  <InformationCircleIcon className="w-4 h-4 text-gray-900" />
                </button>
                <button>
                  <InformationCircleIcon className="w-4 h-4 text-gray-900" />
                </button>
              </div>
              <div className="ml-1 w-8 flex justify-end">
                <Toggle />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current layer */}
      <div
        className="relative flex flex-col flex-grow overflow-hidden border-t border-gray-100"
        style={{
          maxHeight: 400,
        }}
      >
        <div className="overflow-x-hidden overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Legend;
