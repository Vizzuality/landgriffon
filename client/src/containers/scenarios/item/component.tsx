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

  const { hasPermission } = usePermissions(scenario?.user?.id);
  const canEdit = hasPermission(Permission.CAN_EDIT_SCENARIO);

  return (
    <div data-testid={`scenario-item-${scenario.id || 'null'}`}>
      <div
        className={classNames(
          'rounded-lg shadow-sm border p-4 space-y-2',
          isSelected ? 'border-navy-400' : 'border-gray-200',
        )}
      >
        <RadioGroup.Option
          key={scenario.id}
          value={scenario.id}
          className="flex w-full gap-2 items-top"
          data-testid="scenario-item-radio"
        >
          {({ checked }) => (
            <>
              <div className="flex justify-center flex-shrink-0 items-top">
                <span
                  className={classNames(
                    checked ? 'bg-navy-400 border-transparent' : 'bg-white border-gray-300',
                    'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center',
                  )}
                  aria-hidden="true"
                >
                  <span className="rounded-full bg-white w-1.5 h-1.5" />
                </span>
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <h2
                  className={classNames(
                    'text-sm truncate font-normal',
                    isSelected ? 'text-navy-400' : 'text-gray-900',
                  )}
                >
                  {scenario.title}
                </h2>
                {scenario.id ? (
                  <div className="flex items-center justify-between mt-2 space-x-1 text-xs font-medium text-gray-900">
                    <div>Show</div>
                    <div className="flex space-x-1">
                      <div className="inline-flex">
                        <Pill className="inline-flex bg-blue-200 rounded-tr-none rounded-br-none whitespace-nowrap">
                          {/** TODO: this value is hardcoded. Update it when the API takes growth rates into account */}
                          1 growth rate
                        </Pill>
                        <Pill className="inline-flex bg-orange-100 rounded-tl-none rounded-bl-none whitespace-nowrap">
                          {scenario.scenarioInterventions.length} interventions
                        </Pill>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <DatabaseIcon className="w-4 h-4 mr-1" />
                    <span>Based on your uploaded data</span>
                  </div>
                )}
                {scenario.id && scenario.updatedAt && (
                  <div className="flex items-center justify-between mt-4">
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
