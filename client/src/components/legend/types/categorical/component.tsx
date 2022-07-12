import cx from 'classnames';

export type LegendTypeCategoricalProps = {
  className?: string;
  items: Array<{
    value: number | string;
    color: string;
  }>;
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

      <ul className="flex w-full mx-0 mb-0 mt-1">
        {items.map(({ value }) => (
          <li
            key={`${value}`}
            className="flex flex-wrap justify-center leading-4 text-center text-xs"
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
