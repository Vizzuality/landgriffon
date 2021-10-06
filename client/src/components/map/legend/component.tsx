import { useCallback, useState } from 'react';
import cx from 'classnames';

import { ArrowUpIcon } from '@heroicons/react/outline';

export interface LegendProps {
  className?: string;
  children: React.ReactNode;
  maxHeight: string | number;
  onChangeOrder: (id: string[]) => void;
}

export const Legend: React.FC<LegendProps> = ({
  children,
  className = '',
  maxHeight,
}: LegendProps) => {
  const [active, setActive] = useState(false);

  const onToggleActive = useCallback(() => {
    setActive(!active);
  }, [active]);

  return (
    <div
      className={cx('flex flex-col flex-grow', {
        [className]: !!className,
      })}
    >
      <button
        type="button"
        aria-expanded={active}
        className={cx({
          'relative shadow-sm bg-white border border-gray-200 rounded flex justify-space-between w-full px-4 py-2 space-x-2 text-sm text-gray-900 font-heading focus:outline-none':
            !active,
          'absolute w-10 h-8 top-0 right-0 rounded-t-lg bg-gray-500 text-white flex items-center justify-center transform -translate-y-full':
            active,
        })}
        onClick={onToggleActive}
      >
        {!active && <span>Legend</span>}
        <ArrowUpIcon
          className={cx({
            'w-4 h-4 transition-transform transform': true,
            'absolute -translate-y-1/2 top-1/2 right-5': !active,
            'rotate-180': active,
          })}
        />
      </button>

      {active && (
        <div
          className="relative flex flex-col flex-grow overflow-hidden rounded rounded-tr-none border border-gray-200 shadow-sm bg-white rounded"
          style={{
            maxHeight,
          }}
        >
          <div className="absolute top-0 left-0 z-10 w-full h-4 pointer-events-none bg-gradient-to-b from-white via-white" />
          <div className="overflow-x-hidden overflow-y-auto">{children}</div>
          <div className="absolute bottom-0 left-0 z-10 w-full h-3 pointer-events-none bg-gradient-to-t from-white via-white" />
        </div>
      )}
    </div>
  );
};

export default Legend;
