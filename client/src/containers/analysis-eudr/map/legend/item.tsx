import classNames from 'classnames';

import type { FC, PropsWithChildren } from 'react';

type LegendItemProps = { title: string; description: string; iconClassName?: string };

const LegendItem: FC<PropsWithChildren<LegendItemProps>> = ({
  title,
  description,
  children,
  iconClassName,
}) => {
  return (
    <div className="flex space-x-2 p-4">
      <div
        className={classNames(
          'mt-0.5 h-3 w-3 shrink-0',
          iconClassName ?? 'border-2 border-gray-500 bg-gray-500/30',
        )}
      />
      <div className="flex-1 space-y-1">
        <div>
          <h3 className="text-xs font-normal">{title}</h3>
          <div></div>
        </div>
        <p className="text-xs text-gray-500">{description}</p>
        {children}
      </div>
    </div>
  );
};

export default LegendItem;
