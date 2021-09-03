import { ReactChild } from 'react';

export type WidgetProps = {
  title: string;
  children: ReactChild | ReactChild[];
};

const Widget: React.FC<WidgetProps> = ({ title, children }: WidgetProps) => (
  <div className="p-5 bg-white border border-gray-300 rounded-2xl">
    <h2>{title}</h2>
    <div className="relative mt-2 h-96">{children}</div>
  </div>
);

export default Widget;
