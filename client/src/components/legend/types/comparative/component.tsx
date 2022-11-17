import cx from 'classnames';
import { useMemo } from 'react';

import type { Legend, LegendItem } from 'types';

export type LegendTypeComparativeProps = {
  className?: string;
  min: number | string;
  items: Legend['items'];
};

export const LegendTypeComparative: React.FC<LegendTypeComparativeProps> = ({
  className,
  min = 0,
  items = [],
}) => {
  const itemWidth = useMemo<number>(
    () => (items.length === 0 ? 0 : 100 / items.length),
    [items.length],
  );

  const legendItems = useMemo<LegendItem[]>(
    () => [{ label: min.toString(), value: min, color: 'transparent' }, ...items],
    [items, min],
  );

  if (items.length === 0) return null;

  return (
    <div className={cx('w-full', className)}>
      <div className="flex w-full">
        {items.map(({ color }) => (
          <div
            key={`${color}`}
            className="h-2"
            style={{
              width: `${itemWidth}%`,
              backgroundColor: color,
            }}
          />
        ))}
      </div>

      <ul
        className="flex m-0 mt-1 text-2xs"
        style={{ width: `${itemWidth * legendItems.length}%` }}
      >
        {legendItems.map(({ label, value }, i) => (
          <li
            key={`${value}-${i}`}
            className={cx('transform', {
              'text-left': i < (legendItems.length - 1) / 2,
              'text-center -translate-x-1/2': i === (legendItems.length - 1) / 2,
              'text-right -translate-x-full': i > (legendItems.length - 1) / 2,
            })}
            style={{ width: `${itemWidth}%` }}
          >
            <span title={label} className="truncate">
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LegendTypeComparative;
