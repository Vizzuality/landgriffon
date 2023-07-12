import { Popover } from '@headlessui/react';
import classNames from 'classnames';

import Loading from 'components/loading';
import Pill from 'components/pill';
import { useScenarioInterventions } from 'hooks/interventions';

import type { ScenarioInterventionProps } from '../types';

const ScenarioIntervention = ({ scenarioId, display }: ScenarioInterventionProps) => {
  const { data: interventions, isLoading: isInterventionsLoading } = useScenarioInterventions({
    scenarioId,
  });

  return (
    <div
      className={classNames({
        'flex-1': display === 'grid',
      })}
    >
      {display === 'grid' && <h3 className="mb-2 text-xs">Interventions</h3>}
      {isInterventionsLoading && <Loading />}
      {!isInterventionsLoading && interventions && (
        <>
          <div className="flex flex-wrap gap-2">
            {interventions.slice(0, 2).map((intervention) => (
              <Pill
                key={intervention.id}
                className="bg-blue-200"
                data-testid="scenario-interventions-item"
              >
                {intervention.title}
              </Pill>
            ))}
          </div>
          {interventions.length > 2 && (
            <Popover className="relative mt-2 text-xs">
              Show{' '}
              <Popover.Button>
                <Pill className="bg-blue-200">+{interventions.length - 2} more</Pill>
              </Popover.Button>
              <Popover.Panel className="absolute flex flex-col p-4 space-y-2 bg-white border border-gray-100 rounded-md shadow-md">
                {interventions.slice(2, interventions.length).map((intervention) => (
                  <Pill key={intervention.id} className="bg-blue-200">
                    {intervention.title}
                  </Pill>
                ))}
              </Popover.Panel>
            </Popover>
          )}
        </>
      )}
      {!isInterventionsLoading && interventions.length === 0 && (
        <p className="text-xs">No interventions created for this scenario.</p>
      )}
    </div>
  );
};

export default ScenarioIntervention;
