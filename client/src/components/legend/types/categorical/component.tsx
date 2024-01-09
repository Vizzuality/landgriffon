import cx from 'classnames';

import type { Legend } from 'types';

export type LegendTypeCategoricalProps = {
  className?: string;
  items: Legend['items'];
};

export const LegendTypeCategorical = ({
  className = '',
  items = [],
}: LegendTypeCategoricalProps) => {
  if (items.length === 0) return null;

  return (
    <div className={cx('w-full max-w-full', className)}>
      <ul className="flex w-full">
        {items.map(({ color }) => (
          <li
            key={`${color}`}
            className="h-2"
            style={{
              width: `${100 / items.length}%`,
              backgroundColor: color,
            }}
          />
        ))}
      </ul>

      <ul className="mx-0 mb-0 mt-1 flex w-full">
        {items.map(({ label }) => (
          <li
            key={label}
            className="flex flex-wrap justify-center text-center text-2xs leading-4"
            style={{
              width: `${100 / items.length}%`,
            }}
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LegendTypeCategorical;
