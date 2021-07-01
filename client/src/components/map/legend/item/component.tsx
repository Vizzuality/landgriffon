import { FC, ReactNode } from 'react';
import cx from 'classnames';

export interface LegendItemProps {
  id: string;
  name: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export const LegendItem: FC<LegendItemProps> = ({
  id,
  name,
  description,
  icon,
  children,
}: LegendItemProps) => (
  <div key={id} className="py-2.5 px-5">
    <div className="flex">
      <div
        className={cx({
          relative: true,
          'pl-5': icon,
        })}
      >
        {icon && <div className="absolute top-0 left-0">{icon}</div>}
        <div className="text-sm text-white font-heading">{name}</div>
      </div>
    </div>

    <div className="text-sm text-gray-300">{description}</div>

    {children && <div className="mt-2.5">{children}</div>}
  </div>
);

export default LegendItem;
