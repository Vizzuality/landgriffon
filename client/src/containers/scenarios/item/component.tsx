import { Fragment, useEffect } from 'react';
import { differenceInDays, format, formatDistanceToNowStrict } from 'date-fns';
import { RadioGroup } from '@headlessui/react';
import classNames from 'classnames';
import Link from 'next/link';

import { scenarios, setComparisonEnabled } from 'store/features/analysis/scenarios';
import { useAppDispatch, useAppSelector } from 'store/hooks';

import ScenariosComparison from 'containers/scenarios/comparison';
import { ACTUAL_DATA } from '../constants';

import type { Scenario } from '../types';
import { DatabaseIcon } from '@heroicons/react/outline';
import { useMemo } from 'react';
import { Button } from 'components/button';

interface ScenariosItemProps {
  scenario: Scenario;
  isComparisonAvailable: boolean;
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

const ScenarioItem = ({ scenario, isSelected, isComparisonAvailable }: ScenariosItemProps) => {
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
            disabled={!isComparisonAvailable}
            key={scenario.id}
            value={scenario.id}
            className="flex justify-between flex-1 truncate items-top gap-2"
          >
            {({ checked }) => (
              <>
                <div className="flex justify-center flex-shrink-0 items-top">
                  {(scenario.id === ACTUAL_DATA.id || isComparisonAvailable) && (
                    <span
                      className={classNames(
                        checked ? 'bg-primary border-transparent' : 'bg-white border-gray-200',
                        'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center',
                      )}
                      aria-hidden="true"
                    >
                      <span className="rounded-full bg-white w-1.5 h-1.5" />
                    </span>
                  )}
                </div>
                <div className="flex-1 pr-4 truncate space-y-2">
                  <h2
                    className={classNames(
                      'text-sm font-medium truncate',
                      isSelected ? 'text-primary' : 'text-gray-900',
                    )}
                  >
                    {scenario.title}
                  </h2>
                  {scenario.id !== ACTUAL_DATA.id && (
                    <div className="flex">
                      <div className="bg-yellow text-xs px-2 rounded-full">
                        {scenario.scenarioInterventions.length} interventions
                      </div>
                    </div>
                  )}
                  <div>
                    {scenario.id === ACTUAL_DATA.id && (
                      <span className="text-sm text-gray-500 flex flex-row place-items-center">
                        <span>
                          <DatabaseIcon className="w-4 h-4" />
                        </span>
                        <span>Based on your uploaded data</span>
                      </span>
                    )}

                    {scenario.id !== ACTUAL_DATA.id && scenario.updatedAt && (
                      <div className="flex gap-1 w-full min-w-0 flex-row justify-between place-items-center">
                        <div className="text-gray-400 text-xs" title={updatedAt?.toLocaleString()}>
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
        {isComparisonAvailable && isSelected && (
          <div className="">
            <ScenariosComparison />
          </div>
        )}
      </div>
    </li>
  );
};

export default ScenarioItem;
