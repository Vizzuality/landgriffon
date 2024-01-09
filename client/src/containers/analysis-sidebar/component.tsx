import { useMemo, useCallback } from 'react';
import { XCircleIcon, PlusIcon } from '@heroicons/react/solid';
import { RadioGroup } from '@headlessui/react';
import { useRouter } from 'next/router';
import { pickBy } from 'lodash-es';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import {
  scenarios,
  setComparisonEnabled,
  setCurrentScenario,
  setScenarioToCompare as setScenarioToCompareAction,
} from 'store/features/analysis/scenarios';
import { useInfiniteScenarios } from 'hooks/scenarios';
import useBottomScrollListener from 'hooks/scroll';
import { usePermissions } from 'hooks/permissions';
import ScenariosFilters from 'containers/scenarios/filters';
import Loading from 'components/loading';
import ScenarioItem from 'containers/scenarios/item';
import { Permission } from 'hooks/permissions/enums';
import { Anchor } from 'components/button/component';

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
  const { query, push } = useRouter();
  const { scenarioId = ACTUAL_DATA.id } = query;
  const { hasPermission } = usePermissions();

  const canCreateScenario = hasPermission(Permission.CAN_CREATE_SCENARIO);

  const { sort, searchTerm } = useAppSelector(scenarios);
  const dispatch = useAppDispatch();
  const { fetchNextPage, hasNextPage, data, isLoading, error } = useInfiniteScenarios({
    sort: sort as string,
    'page[size]': 10,
    'search[title]': searchTerm,
    include: 'scenarioInterventions,user',
    hasActiveInterventions: true,
  });

  const scenariosList: Scenario[] = useMemo(() => {
    const { pages } = data || {};
    return pages?.reduce((acc, { data }) => acc.concat(data?.data), []);
  }, [data]);

  const handleOnChange = useCallback(
    (id: Scenario['id']) => {
      push({ query: pickBy({ ...query, compareScenarioId: null, scenarioId: id }) }, null, {
        shallow: false,
      });

      // TODO: deprecated, we'll keep only for retro-compatibility
      dispatch(setCurrentScenario(id));
      dispatch(setScenarioToCompareAction(null));
      dispatch(setComparisonEnabled(false));
    },
    [dispatch, push, query],
  );

  useBottomScrollListener(
    () => {
      if (hasNextPage) fetchNextPage();
    },
    scrollref,
    { triggerOnNoScroll: true },
  );

  return (
    <div className="flex h-full flex-col bg-white text-gray-900">
      <div className="after:content pointer-events-none sticky top-0 z-20 bg-white pt-10 text-sm after:absolute after:-bottom-3 after:left-0 after:h-3 after:w-full after:bg-gradient-to-b after:from-white">
        <h1 className="mb-6">Analyze data</h1>
      </div>

      <div className="mt-4 flex-1 space-y-6">
        <RadioGroup value={scenarioId} onChange={handleOnChange}>
          <RadioGroup.Label className="sr-only">Scenarios</RadioGroup.Label>
          <div className="space-y-6">
            {/* Actual data */}
            <ScenarioItem scenario={ACTUAL_DATA} isSelected={scenarioId === ACTUAL_DATA.id} />
            <ScenariosFilters />
            {/* Scenarios */}
            {((!isLoading && !error && scenariosList && scenariosList.length > 0) ||
              !!searchTerm ||
              searchTerm !== '') && (
              <div className="relative z-10 flex-1 overflow-hidden">
                <ul className="relative my-2 grid grid-cols-1 gap-5 overflow-auto">
                  {scenariosList?.map((item) => (
                    <li key={item.id} className="last-of-type:mb-12">
                      <ScenarioItem scenario={item} isSelected={scenarioId === item.id} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </RadioGroup>

        {!isLoading && error && (
          <div className="my-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
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
            <Loading className="h-5 w-5 text-navy-400" />
          </div>
        )}

        {/* No scenarios */}
        {!isLoading &&
          (!searchTerm || searchTerm === '') &&
          (!scenariosList || scenariosList?.length === 0) && (
            <div className="space-y-12">
              <div className="space-y-6 text-sm">
                <p>
                  Scenarios let you <strong>simulate changes</strong> in sourcing to evaluate how
                  they would affect impacts and risks.
                </p>
                <p>Create a scenario to get started.</p>
              </div>
              <Anchor
                href="/data/scenarios/new"
                className="block w-full"
                variant="primary"
                size="xl"
                data-testid="create-scenario"
                disabled={!canCreateScenario}
                icon={
                  <div
                    aria-hidden="true"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white"
                  >
                    <PlusIcon className="h-4 w-4 text-navy-400" />
                  </div>
                }
              >
                Add new scenario
              </Anchor>
            </div>
          )}

        {!!searchTerm && searchTerm !== '' && scenariosList?.length === 0 && (
          <div className="text-sm">
            No scenarios with at least one active intervention were found.
          </div>
        )}
      </div>

      {scenariosList?.length > 0 && (
        <div className="before:content sticky bottom-0 left-0 z-20 w-full bg-white pb-6 before:absolute before:-top-16 before:left-0 before:h-16 before:w-full before:bg-gradient-to-t before:from-white">
          <Anchor
            href="/data/scenarios/new"
            className="w-full"
            variant="secondary"
            icon={
              <div
                aria-hidden="true"
                className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-400"
              >
                <PlusIcon className="h-4 w-4 text-white" />
              </div>
            }
            data-testid="create-scenario"
            disabled={!canCreateScenario}
          >
            Add new scenario
          </Anchor>
        </div>
      )}
    </div>
  );
};

export default ScenariosComponent;
