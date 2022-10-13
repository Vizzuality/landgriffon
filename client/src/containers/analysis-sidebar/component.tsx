import { useMemo, useCallback } from 'react';
import { XCircleIcon, PlusIcon } from '@heroicons/react/solid';
import { RadioGroup } from '@headlessui/react';
import Link from 'next/link';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import {
  scenarios,
  setComparisonEnabled,
  setCurrentScenario,
  setScenarioToCompare,
} from 'store/features/analysis/scenarios';
import { useInfiniteScenarios } from 'hooks/scenarios';
import useBottomScrollListener from 'hooks/scroll';

import ScenariosFilters from 'containers/scenarios/filters';
import { Anchor } from 'components/button';
import Loading from 'components/loading';
import ScenarioItem from 'containers/scenarios/item';

import type { MutableRefObject } from 'react';
import type { Scenario } from 'containers/scenarios/types';

/**
 * Actual data to the data response
 */
const ACTUAL_DATA: Scenario = {
  id: null, // reserved id only for actual-data
  title: 'Actual data',
};

const ScenariosComponent: React.FC<{ scrollref?: MutableRefObject<HTMLDivElement> }> = ({
  scrollref,
}) => {
  const { currentScenario, sort, searchTerm } = useAppSelector(scenarios);
  const dispatch = useAppDispatch();
  const { fetchNextPage, hasNextPage, data, isLoading, error } = useInfiniteScenarios({
    sort: sort as string,
    searchTerm,
    include: 'scenarioInterventions',
  });

  const scenariosList: Scenario[] = useMemo(() => {
    const { pages } = data || {};
    return pages?.reduce((acc, { data }) => acc.concat(data?.data), []);
  }, [data]);

  const handleOnChange = useCallback(
    (id: Scenario['id']) => {
      dispatch(setCurrentScenario(id));
      dispatch(setComparisonEnabled(false));

      // TODO: if done one after the other, the query middleware overrides the values stored in the query params
      setTimeout(() => {
        dispatch(setScenarioToCompare(null));
      }, 0);
    },
    [dispatch],
  );

  useBottomScrollListener(
    () => {
      if (hasNextPage) fetchNextPage();
    },
    scrollref,
    { triggerOnNoScroll: true },
  );

  return (
    <div className="flex flex-col h-full text-gray-900 bg-white">
      <div className="sticky top-0 z-20 pt-10 text-sm bg-white after:bg-gradient-to-b after:from-white after:w-full after:h-3 after:content after:-bottom-3 after:left-0 after:absolute">
        <h1 className="mb-12">Analyze data</h1>
      </div>

      <div className="flex-1 mt-4 space-y-6">
        <RadioGroup value={currentScenario} onChange={handleOnChange}>
          <RadioGroup.Label className="sr-only">Scenarios</RadioGroup.Label>
          <div className="space-y-6">
            {/* Actual data */}
            <ScenarioItem scenario={ACTUAL_DATA} isSelected={!currentScenario} />
            {/* Scenarios */}
            {!isLoading && !error && scenariosList.length > 0 && (
              <>
                <div>
                  <ScenariosFilters />
                </div>
                <div className="relative z-10 flex-1 overflow-hidden">
                  <ul className="relative grid grid-cols-1 gap-5 my-2 overflow-auto sm:gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    {scenariosList.map((item) => (
                      <li key={item.id} className="last-of-type:mb-12">
                        <ScenarioItem scenario={item} isSelected={currentScenario === item.id} />
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </RadioGroup>

        {!isLoading && error && (
          <div className="p-4 my-4 rounded-md bg-red-50">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="w-5 h-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  There was an error with your request
                </h3>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center p-6 ">
            <Loading className="w-5 h-5 text-navy-400" />
          </div>
        )}

        {/* No scenarios */}
        {!isLoading && scenariosList.length === 0 && (
          <div className="space-y-12">
            <div className="space-y-6 text-sm">
              <p>
                Scenarios let you <strong>simulate changes</strong> in sourcing to evaluate how they
                would affect impacts and risks.
              </p>
              <p>Create a scenario to get started.</p>
            </div>
            <Link href="/admin/scenarios/new">
              <Anchor
                className="block w-full"
                variant="primary"
                size="xl"
                icon={
                  <div
                    aria-hidden="true"
                    className="flex items-center justify-center w-5 h-5 bg-white rounded-full"
                  >
                    <PlusIcon className="w-4 h-4 text-navy-400" />
                  </div>
                }
              >
                Add new scenario
              </Anchor>
            </Link>
          </div>
        )}
      </div>

      {scenariosList.length > 0 && (
        <div className="sticky bottom-0 left-0 z-20 w-full pb-6 bg-white before:bg-gradient-to-t before:from-white before:w-full before:h-16 before:content before:-top-16 before:left-0 before:absolute">
          <Link href="/admin/scenarios/new">
            <Anchor
              className="w-full"
              variant="secondary"
              icon={
                <div
                  aria-hidden="true"
                  className="flex items-center justify-center w-5 h-5 rounded-full bg-navy-400"
                >
                  <PlusIcon className="w-4 h-4 text-white" />
                </div>
              }
            >
              Add new scenario
            </Anchor>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ScenariosComponent;
