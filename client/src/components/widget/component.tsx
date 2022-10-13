import cx from 'classnames';

import type { ReactChild } from 'react';

export type WidgetProps = {
  title: string;
  unit: string;
  className?: string;
  height?: number | string;
  children: ReactChild | ReactChild[];
};

const Widget: React.FC<WidgetProps> = ({ title, className, height, children, unit }) => (
  <div className={cx('flex flex-col', className)} style={{ height }}>
    <h2 className="flex-shrink-0 text-base first-letter:uppercase">{`${title} (${unit})`}</h2>
    <div className="relative flex-grow mt-2">{children}</div>
  </div>
);

export default Widget;
