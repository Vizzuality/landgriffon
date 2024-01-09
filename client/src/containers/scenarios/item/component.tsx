import { differenceInDays, format, formatDistanceToNowStrict } from 'date-fns';
import { RadioGroup } from '@headlessui/react';
import classNames from 'classnames';
import { DatabaseIcon } from '@heroicons/react/outline';
import { useMemo } from 'react';

import ScenariosComparison from 'containers/scenarios/comparison';
import { Anchor } from 'components/button';
import Pill from 'components/pill';
import { usePermissions } from 'hooks/permissions';
import { Permission } from 'hooks/permissions/enums';

import type { Scenario } from '../types';

interface ScenariosItemProps {
  scenario: Scenario;
  isSelected: boolean;
}

const formatTimeAgo = (date: Date) => {
  const diffDays = differenceInDays(new Date(), date);

  const formattedHour = format(date, 'HH:mm');

  if (diffDays === 0) {
    return `Today ${formattedHour}`;
  }
  if (diffDays === 1) {
    return `Yesterday ${formattedHour}`;
  }

  return `${formatDistanceToNowStrict(date, {
    addSuffix: true,
    unit: 'day',
  })} ${formattedHour}`;
};

const ScenarioItem = ({ scenario, isSelected }: ScenariosItemProps) => {
  const updatedAt = useMemo(
    () => (scenario.updatedAt ? new Date(scenario.updatedAt) : null),
    [scenario.updatedAt],
  );

  const formattedUpdatedAgo = useMemo(
    () => (updatedAt ? formatTimeAgo(new Date(updatedAt)) : null),
    [updatedAt],
  );

  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(Permission.CAN_EDIT_SCENARIO, scenario.user?.id);

  return (
    <div data-testid={`scenario-item-${scenario.id || 'null'}`}>
      <div
        className={classNames(
          'space-y-2 rounded-lg border p-4 shadow-sm',
          isSelected ? 'border-navy-400' : 'border-gray-200',
        )}
      >
        <RadioGroup.Option
          key={scenario.id}
          value={scenario.id}
          className="items-top flex w-full gap-2"
          data-testid="scenario-item-radio"
        >
          {({ checked }) => (
            <>
              <div className="items-top flex flex-shrink-0 justify-center">
                <span
                  className={classNames(
                    checked ? 'border-transparent bg-navy-400' : 'border-gray-300 bg-white',
                    'mt-0.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border',
                  )}
                  aria-hidden="true"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
              </div>
              <div className="min-w-0 flex-1 pr-4">
                <h2
                  className={classNames(
                    'truncate text-sm font-normal',
                    isSelected ? 'text-navy-400' : 'text-gray-900',
                  )}
                >
                  {scenario.title}
                </h2>
                {scenario.id ? (
                  <div className="mt-2 flex items-center justify-between space-x-1 text-xs font-medium text-gray-900">
                    <div>Show</div>
                    <div className="flex space-x-1">
                      <div className="inline-flex">
                        <Pill className="inline-flex whitespace-nowrap rounded-br-none rounded-tr-none bg-blue-200">
                          {/** TODO: this value is hardcoded. Update it when the API takes growth rates into account */}
                          1 growth rate
                        </Pill>
                        <Pill className="inline-flex whitespace-nowrap rounded-bl-none rounded-tl-none bg-orange-100">
                          {scenario.scenarioInterventions.length} interventions
                        </Pill>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <DatabaseIcon className="mr-1 h-4 w-4" />
                    <span>Based on your uploaded data</span>
                  </div>
                )}
                {scenario.id && scenario.updatedAt && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-400" title={updatedAt?.toLocaleString()}>
                      Modified: {formattedUpdatedAgo}
                    </div>
                    {isSelected && (
                      <div>
                        <Anchor
                          href={`/data/scenarios/${scenario.id}/edit`}
                          variant="white"
                          size="xs"
                          disabled={!canEdit}
                        >
                          Edit
                        </Anchor>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </RadioGroup.Option>
        {isSelected && <ScenariosComparison />}
      </div>
    </div>
  );
};

export default ScenarioItem;
