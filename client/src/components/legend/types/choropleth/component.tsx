import cx from 'classnames';

export type LegendTypeChoroplethProps = {
  className?: string;
  min: number | string;
  items: Array<{
    value: number | string;
    color: string;
  }>;
};

export const LegendTypeChoropleth: React.FC<LegendTypeChoroplethProps> = ({
  className = '',
  min = 0,
  items = [],
}: LegendTypeChoroplethProps) => {
  if (items.length === 0) return null;

  return (
    <div
      className={cx('px-4', {
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

      <ul className="flex w-full m-0">
        {min && (
          <li className="text-xs flex justify-start w-0">
            <span className="transform -translate-x-1/2 break-normal whitespace-nowrap">{min}</span>
          </li>
        )}
        {items.map(({ value }) => (
          <li
            key={`${value}`}
            className="flex justify-end text-xs"
            style={{
              width: `${100 / items.length}%`,
            }}
          >
            <span className="transform translate-x-1/2 break-normal whitespace-nowrap">
              {value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LegendTypeChoropleth;
