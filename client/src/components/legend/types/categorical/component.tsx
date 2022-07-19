import cx from 'classnames';
import type { Legend } from 'types';

export type LegendTypeCategoricalProps = {
  className?: string;
  items: Legend['items'];
};

export const LegendTypeCategorical: React.FC<LegendTypeCategoricalProps> = ({
  className = '',
  items = [],
}: LegendTypeCategoricalProps) => {
  if (items.length === 0) return null;

  return (
    <div
      className={cx('px-4 w-full max-w-full', {
        [className]: !!className,
      })}
    >
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

      <ul className="flex w-full mx-0 mt-1 mb-0">
        {items.map(({ value }) => (
          <li
            key={`${value}`}
            className="flex flex-wrap justify-center text-xs leading-4 text-center"
            style={{
              width: `${100 / items.length}%`,
            }}
          >
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LegendTypeCategorical;
