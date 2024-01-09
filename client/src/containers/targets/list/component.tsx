import { useMemo } from 'react';

import TargetItem from 'containers/targets/item/component';

import type { TargetsListProps } from './types';

const TargetsList: React.FC<TargetsListProps> = ({ data }) => {
  // Getting all the years from the targets
  const years = useMemo<number[]>(() => {
    const result = [];
    data.forEach(({ years }) => {
      years.forEach(({ year }) => {
        if (!result.includes(year)) {
          result.push(year);
        }
      });
    });
    return result;
  }, [data]);

  return (
    <div className="space-y-1">
      <div className="rounded-sm bg-gray-50 shadow-sm">
        <div className="grid grid-cols-12 items-center justify-between gap-4 text-xs font-semibold uppercase text-gray-500">
          <div className="col-span-3 p-4">Indicator</div>
          <div className="col-span-2 p-4 text-center">Baseline</div>
          <div className="col-span-7 p-4">
            Percentage of reduction <span className="lowercase">(from baseline year)</span>
          </div>
        </div>
        {/* Years */}
        <div className="grid grid-cols-12 gap-4 border-t border-gray-100 text-sm uppercase text-gray-400">
          <div className="col-span-3 p-4" />
          <div className="col-span-2 p-4 text-center">2021</div>
          <div className="col-span-7 grid grid-cols-4 gap-4 p-4">
            {years.map((year) => (
              <div key={`target-head-${year}`} className="text-center">
                {year}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-1">
        {data.map((target) => (
          <TargetItem key={target.id} {...target} />
        ))}
      </div>
    </div>
  );
};

export default TargetsList;
