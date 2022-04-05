import { FC, useCallback, useState } from 'react';

import Button from 'components/button';

import type { ScenarioInterventionsGrowthItems } from 'containers/scenarios/types';

const InterventionsList: FC<ScenarioInterventionsGrowthItems> = ({
  items,
}: ScenarioInterventionsGrowthItems) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleOpen = useCallback(() => setIsOpen(!isOpen), [setIsOpen, isOpen]);

  return items?.length > 0 ? (
    <div className="bg-white border border-gray-300 overflow-hidden rounded-md mt-4">
      <ul className="divide-y divide-gray-300 text-sm">
        {items.map((intervention) => (
          <li key={intervention.id} className="px-4 py-4 sm:px-6" onClick={handleToggleOpen}>
            {intervention.title}
            {isOpen && (
              <>
                <p className="text-sm text-green-700 py-4">
                  New contract with sustainability assesment.
                </p>
                <div className="flex justify-start space-x-2">
                  <Button theme="secondary" size="xs">
                    Delete
                  </Button>
                  <Button theme="secondary" size="xs">
                    Disable
                  </Button>
                  <Button size="xs">Edit</Button>
                </div>
              </>
            )}
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
