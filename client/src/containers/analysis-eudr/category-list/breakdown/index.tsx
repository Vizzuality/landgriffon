import BreakdownItem from './breakdown-item';

import type { ComponentProps } from 'react';

const Breakdown = ({ data }: { data: ComponentProps<typeof BreakdownItem>[] }): JSX.Element => {
  return (
    <div className="divide-y divide-dashed divide-gray-200">
      {data.map((item) => (
        <BreakdownItem key={`${item.id}-${item.color}`} {...item} />
      ))}
    </div>
  );
};

export default Breakdown;
