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
      className={cx('bg-white rounded-lg flex flex-col flex-grow border border-gray-200', {
        [className]: !!className,
      })}
    >
      <button
        type="button"
        aria-expanded={active}
        className="relative flex justify-space-between w-full px-4 py-2 space-x-2 text-sm text-black font-heading focus:outline-none"
        onClick={onToggleActive}
      >
        <span>Legend</span>

        <ArrowUpIcon
          className={cx({
            'absolute w-3 h-3 transition-transform transform -translate-y-1/2 text-black top-1/2 right-5':
              true,
            'rotate-180': active,
          })}
        />
      </button>

      {active && (
        <div
          className="relative flex flex-col flex-grow overflow-hidden rounded-lg rounded-t-none"
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
