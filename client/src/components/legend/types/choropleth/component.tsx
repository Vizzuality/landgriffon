import cx from 'classnames';
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
  if (items.length === 0) return null;

  return (
    <div className={cx('px-4 w-full max-w-full', className)}>
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

      <ul className="flex w-full m-0">
        {(!!min || min === 0) && (
          <li className="relative flex justify-start w-0 text-xs">
            <span className="absolute w-4 truncate left">{min}</span>
          </li>
        )}
        {items.map(({ label, value }, i) => (
          <li
            key={`${value}-${i}`}
            className="flex justify-end text-xs text-center"
            style={{
              width: `${100 / items.length}%`,
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
