import { format } from 'date-fns';
import classNames from 'classnames';

import ScenarioInterventions from '../scenario-items/interventions';
import ScenarioGrowthRate from '../scenario-items/growth-rate';
import ScenarioMakePublic from '../scenario-items/make-public';
import ScenarioActions from '../scenario-items/actions';

import type { ScenarioCardProps } from './types';

const ScenarioCard: React.FC<ScenarioCardProps> = ({
  data,
  display = 'grid',
  canDeleteScenario,
  canEditScenario,
  onDelete,
}) => {
  return (
    <>
      <div
        className={classNames('bg-white', {
          'w-full  xl:max-w-none': display === 'list',
          'rounded-[10px] shadow-gray-200 shadow-sm border border-gray-200': display === 'grid',
        })}
        data-testid="scenario-card"
      >
        <div
          className={classNames('p-6', {
            'grid auto grid-cols-[repeat(5,_minmax(fit-content(100px),_1fr))] gap-4':
              display === 'list',
            'flex flex-col space-y-6 h-full': display === 'grid',
          })}
        >
          <div className="flex flex-col">
            <div
              className={classNames('text-xs leading-4 text-gray-400', {
                'order-last mt-1': display === 'list',
              })}
            >
              Modified: {format(new Date(data.updatedAt), 'yyyy/MM/dd')}
            </div>
            <h2 className="text-lg break-words" data-testid="scenario-title">
              {data.title}
            </h2>
            {data.description && display === 'grid' && (
              <p className="mt-2 text-xs leading-5 text-gray-500">{data.description}</p>
            )}
          </div>
          {/* TO-DO: Fix growth rate of 1.5% meanwhile is implemented in the API */}
          <ScenarioGrowthRate display={display} />
          <ScenarioInterventions scenarioId={data.id} display={display} />
          <ScenarioMakePublic
            id={data.id}
            isPublic={data.isPublic}
            display="grid"
            canEditScenario={canEditScenario}
          />
          <ScenarioActions
            display={display}
            scenarioId={data.id}
            setDeleteVisibility={() => onDelete(data.id)}
            canDeleteScenario={canDeleteScenario}
            canEditScenario={canEditScenario}
          />
        </div>
      </div>
    </>
  );
};

export default ScenarioCard;
