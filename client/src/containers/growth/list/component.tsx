import type { FC } from 'react';

import type { ScenarioInterventionsGrowthItems } from 'containers/scenarios/types';

const GrowthList: FC<ScenarioInterventionsGrowthItems> = ({
  items,
}: ScenarioInterventionsGrowthItems) => {
  return items?.length > 0 ? (
    <div className="bg-white border border-gray-300 overflow-hidden rounded-md mt-4">
      <ul className="divide-y divide-gray-300">
        {items.map((item) => (
          <li key={item.id} className="px-4 py-4 sm:px-6">
            <p>{item.title}</p>
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <div>
      <div className="p-6 text-center">
        <p className="text-sm">
          Growth rates set your expectations of how purchaces of raw materials will change into the{' '}
          future. Add a new rule to get started.
        </p>
      </div>
    </div>
  );
};

export default GrowthList;
