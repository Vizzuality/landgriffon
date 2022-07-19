import cx from 'classnames';
import type { Legend } from 'types';

export interface LegendTypeGradientProps {
  className?: string;
  items: Legend['items'];
}

export const LegendTypeGradient: React.FC<LegendTypeGradientProps> = ({
  className = '',
  items,
}: LegendTypeGradientProps) => (
  <div
    className={cx({
      [className]: !!className,
    })}
  >
    <div
      className="flex w-full h-2"
      style={{
        backgroundImage: `linear-gradient(to right, ${items.map((i) => i.color).join(',')})`,
      }}
    />

    <ul className="flex justify-between w-full mt-1">
      {items
        .filter(({ value }) => !!value)
        .map(({ value }) => (
          <li key={`${value}`} className="flex-shrink-0 text-xs">
            {value}
          </li>
        ))}
    </ul>
  </div>
);

export default LegendTypeGradient;
