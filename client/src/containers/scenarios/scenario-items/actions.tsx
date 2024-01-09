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
  }, [setDeleteVisibility]);

  return (
    <div
      className={classNames({
        'space-between my-6 flex': display === 'grid',
        'mx-auto my-4 flex w-fit flex-col items-end gap-2': display === 'list',
      })}
    >
      <Button
        variant="white"
        onClick={handleDeleteClick}
        icon={<TrashIcon className="-mr-0.5" />}
        data-testid="scenario-delete-btn"
        disabled={!canDeleteScenario}
        className="min-w- w-fit pl-3 pr-3"
      >
        Delete
      </Button>
      <div
        className={classNames('flex flex-1 items-center space-x-4', {
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
            'w-[90px] grow': display === 'list',
          })}
        >
          Analyze
        </Anchor>
      </div>
    </div>
  );
};

export default ScenarioActions;
