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
  const itemWidth = useMemo(
    () => (items.length === 0 ? 0 : `${100 / items.length}%`),
    [items.length],
  );
  if (items.length === 0) return null;

  return (
    <div className={cx('w-full max-w-full', className)}>
      <ul className="flex w-full">
        {items.map(({ color }) => (
          <li
            key={`${color}`}
            className="h-2"
            style={{
              width: itemWidth,
              maxWidth: itemWidth,
              backgroundColor: color,
            }}
          />
        ))}
      </ul>

      <ul className="flex w-full m-0 text-3xs">
        {(!!min || min === 0) && (
          <li className="relative flex justify-start w-0">
            <span className="absolute w-4 truncate left">{min}</span>
          </li>
        )}
        {items.map(({ label, value }, i) => (
          <li
            key={`${value}-${i}`}
            className="flex justify-end text-center"
            style={{
              width: itemWidth,
              maxWidth: itemWidth,
            }}
          >
            <span title={label} className="w-full truncate transform translate-x-1/2">
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LegendTypeChoropleth;
