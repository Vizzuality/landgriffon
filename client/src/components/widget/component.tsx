import cx from 'classnames';
import { ReactChild } from 'react';

export type WidgetProps = {
  title: string;
  className?: string;
  height?: number | string;
  children: ReactChild | ReactChild[];
};

const Widget: React.FC<WidgetProps> = ({ title, className, height, children }) => (
  <div className={cx('flex flex-col p-5 bg-white rounded shadow-sm', className)} style={{ height }}>
    <h2 className="flex-shrink-0">{title}</h2>
    <div className="relative flex-grow mt-2">{children}</div>
  </div>
);

export default Widget;
