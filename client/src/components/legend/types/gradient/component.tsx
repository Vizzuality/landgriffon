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
      className="flex h-2 w-full"
      style={{
        backgroundImage: `linear-gradient(to right, ${items.map((i) => i.color).join(',')})`,
      }}
    />

    <ul className="mt-1 flex w-full justify-between">
      {items
        .filter(({ value }) => !!value)
        .map(({ label }) => (
          <li key={label} className="flex-shrink-0 text-xs">
            {label}
          </li>
        ))}
    </ul>
  </div>
);

export default LegendTypeGradient;
