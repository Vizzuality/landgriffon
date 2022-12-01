import cx from 'classnames';
import { useMemo } from 'react';

import type { Legend } from 'types';

export type LegendTypeChoroplethProps = {
  className?: string;
  min: number | string;
  items: Legend['items'];
};

export const LegendTypeChoropleth: React.FC<LegendTypeChoroplethProps> = ({
  className,
  min = 0,
  items = [],
}) => {
  const itemWidth = useMemo<number>(
    () => Math.floor(items.length === 0 ? 0 : 100 / items.length),
    [items.length],
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
        style={{ width: `${itemWidth * (items.length + 1)}%` }}
      >
        {(!!min || min === 0) && (
          <li className="text-left group/item" style={{ width: `${itemWidth}%` }}>
            <span className="truncate" title={min as string}>
              {min}
            </span>
          </li>
        )}
        {items.map(({ label, value }, i) => (
          <li
            key={`${value}-${i}`}
            className={cx('text-center transform', {
              '-translate-x-1/2': i < items.length - 1,
              '-translate-x-full text-right': i === items.length - 1,
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

export default LegendTypeChoropleth;
