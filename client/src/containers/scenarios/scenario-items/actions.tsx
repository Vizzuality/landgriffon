import { TrashIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import { useCallback } from 'react';

import { Anchor, Button } from 'components/button';

import type { ScenarioActionsProps } from '../types';

const ScenarioActions = ({
  display,
  scenarioId,
  setDeleteVisibility,
  canDeleteScenario,
  canEditScenario,
}: ScenarioActionsProps) => {
  const handleDeleteClick = useCallback(() => {
    setDeleteVisibility();
  }, []);

  return (
    <div
      className={classNames({
        'flex space-between my-6': display === 'grid',
        'flex flex-col gap-2 items-end w-fit mx-auto my-4': display === 'list',
      })}
    >
      <Button
        variant="white"
        onClick={handleDeleteClick}
        icon={<TrashIcon className="-mr-0.5" />}
        data-testid="scenario-delete-btn"
        disabled={!canDeleteScenario}
        className="w-fit min-w- pr-3 pl-3"
      >
        Delete
      </Button>
      <div
        className={classNames('flex items-center flex-1 space-x-4', {
          'justify-between': display === 'list',
          'justify-end': display === 'grid',
        })}
      >
        <Anchor
          href={`/data/scenarios/${scenarioId}/edit`}
          variant="secondary"
          className={classNames({
            grow: display === 'list',
          })}
          disabled={!canEditScenario}
          data-testid="scenario-edit-btn"
        >
          Edit Scenario
        </Anchor>
        <Anchor
          href={{ pathname: `/analysis/table`, query: { scenarioId } }}
          variant="primary"
          className={classNames({
            'grow w-[90px]': display === 'list',
          })}
        >
          Analyze
        </Anchor>
      </div>
    </div>
  );
};

export default ScenarioActions;
