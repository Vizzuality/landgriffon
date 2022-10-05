import { Fragment, useEffect } from 'react';
import { differenceInDays, format, formatDistanceToNowStrict } from 'date-fns';
import { RadioGroup } from '@headlessui/react';
import classNames from 'classnames';
import Link from 'next/link';

import { scenarios, setComparisonEnabled } from 'store/features/analysis/scenarios';
import { useAppDispatch, useAppSelector } from 'store/hooks';

import ScenariosComparison from 'containers/scenarios/comparison';

import type { Scenario } from '../types';
import { DatabaseIcon } from '@heroicons/react/outline';
import { useMemo } from 'react';
import { Button } from 'components/button';

interface ScenariosItemProps {
  scenario: Scenario;
  isSelected: boolean;
}

const formatTimeAgo = (date: Date) => {
  // const diffDays = differenceInDays(new Date(), subDays(new Date(), 1.5));
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
  const dispatch = useAppDispatch();
  const { currentScenario, scenarioToCompare } = useAppSelector(scenarios);

  useEffect(() => {
    // Disabling comparison when is not selected
    if (!isSelected) dispatch(setComparisonEnabled(false));
  }, [dispatch, isSelected]);

  useEffect(() => {
    // Disabling comparison when is not selected
    dispatch(setComparisonEnabled(!!currentScenario && !!scenarioToCompare));
  }, [dispatch, currentScenario, scenarioToCompare]);

  const updatedAt = useMemo(
    () => (scenario.updatedAt ? new Date(scenario.updatedAt) : null),
    [scenario.updatedAt],
  );

  const formattedUpdatedAgo = useMemo(
    () => (updatedAt ? formatTimeAgo(new Date(updatedAt)) : null),
    [updatedAt],
  );

  return (
    <li className="col-span-1 last-of-type:mb-6">
      <div
        className={classNames(
          'rounded-md shadow-sm border p-4 space-y-4',
          isSelected ? 'border-primary' : 'border-gray-300',
        )}
      >
        <div className="flex items-center">
          <RadioGroup.Option
            key={scenario.id}
            value={scenario.id}
            className="flex justify-between flex-1 gap-2 truncate items-top"
          >
            {({ checked }) => (
              <>
                <div className="flex justify-center flex-shrink-0 items-top">
                  <span
                    className={classNames(
                      checked ? 'bg-primary border-transparent' : 'bg-white border-gray-200',
                      'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center',
                    )}
                    aria-hidden="true"
                  >
                    <span className="rounded-full bg-white w-1.5 h-1.5" />
                  </span>
                </div>
                <div className="flex-1 pr-4 space-y-2 truncate">
                  <h2
                    className={classNames(
                      'text-sm font-medium truncate',
                      isSelected ? 'text-primary' : 'text-gray-900',
                    )}
                  >
                    {scenario.title}
                  </h2>
                  {scenario.id ? (
                    <div className="flex">
                      <div className="px-2 text-xs rounded-full bg-yellow">
                        {scenario.scenarioInterventions.length} interventions
                      </div>
                    </div>
                  ) : (
                    <span className="flex flex-row text-sm text-gray-500 place-items-center">
                      <span>
                        <DatabaseIcon className="w-4 h-4" />
                      </span>
                      <span>Based on your uploaded data</span>
                    </span>
                  )}
                  <div>
                    {scenario.id && scenario.updatedAt && (
                      <div className="flex flex-row justify-between w-full min-w-0 gap-1 place-items-center">
                        <div className="text-xs text-gray-400" title={updatedAt?.toLocaleString()}>
                          Modified: {formattedUpdatedAgo}
                        </div>
                        <div>
                          <Link href={`/admin/scenarios/${scenario.id}/edit`}>
                            <a>
                              <Button theme="secondary">Edit</Button>
                            </a>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </RadioGroup.Option>
        </div>
        {isSelected && (
          <div className="">
            <ScenariosComparison />
          </div>
        )}
      </div>
    </li>
  );
};

export default ScenarioItem;
