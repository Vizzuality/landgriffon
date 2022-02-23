import { FC } from 'react';

import { ScenarioInterventionsGrowthItems } from 'containers/scenarios/types';

const InterventionsList: FC<ScenarioInterventionsGrowthItems> = ({
  items,
}: ScenarioInterventionsGrowthItems) => {
  return items?.length > 0 ? (
    <div className="bg-white border border-gray-300 overflow-hidden rounded-md mt-4">
      <ul className="divide-y divide-gray-300 text-sm">
        {items.map((intervention) => (
          <li key={intervention.id} className="px-4 py-4 sm:px-6">
            <p>{intervention.title}</p>
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <p className="mt-4 text-sm text-center">
      Each intervention is a specific change in sourcing. Create an intervention to get started
    </p>
  );
};

export default InterventionsList;
