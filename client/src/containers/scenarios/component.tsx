import { MutableRefObject, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import Lottie from 'lottie-react';
import { PlusIcon, XCircleIcon } from '@heroicons/react/solid';
import toast from 'react-hot-toast';

import { useAppDispatch } from 'store/hooks';
import { setMode, setCurrentScenario } from 'store/features/analysis/scenarios';
import { useInfiniteScenarios, useCreateScenario } from 'hooks/scenarios';
import useBottomScrollListener from 'hooks/scroll';

import noScenariosAnimationData from 'containers/scenarios/animations/noScenariosAnimationData.json';
import ScenariosFilters from 'containers/scenarios/filters';
import ScenariosList from 'containers/scenarios/list';
import Button from 'components/button';

import type { ErrorResponse } from 'types';
import type { Scenario } from './types';

const ScenariosComponent: React.FC<{ scrollRef?: MutableRefObject<HTMLDivElement> }> = ({
  scrollRef,
}) => {
  const dispatch = useAppDispatch();
  const { query } = useRouter();
  const params = query ? { sort: query.sortBy as string } : null;
  const { fetchNextPage, hasNextPage, data, isLoading, error } = useInfiniteScenarios(params);

  const scenarios: Scenario[] = useMemo(() => {
    const { pages } = data || {};
    return pages?.reduce((acc, { data }) => acc.concat(data?.data), []);
  }, [data]);

  useBottomScrollListener(() => {
    if (hasNextPage) fetchNextPage();
  }, scrollRef);

  const createScenario = useCreateScenario();

  const handleClick = useCallback(() => {
    createScenario.mutate(
      { title: 'Untitled' },
      {
        onSuccess: ({ data }) => {
          const {
            data: { id: scenarioId },
          } = data;
          dispatch(setCurrentScenario(scenarioId));
          dispatch(setMode('edit'));
          toast.success('A new scenario has been created');
        },
        onError: (error: ErrorResponse) => {
          const { errors } = error.response?.data;
          errors.forEach(({ title }) => toast.error(title));
        },
      },
    );
  }, [createScenario, dispatch]);

  return (
    <div className="bg-white overscroll-contain text-gray-900">
      <div className="sticky top-0 z-10 bg-white py-4 text-sm">
        <h1>Scenarios</h1>
        <p className="my-2">Select the scenario you want to analyse</p>
        {!isLoading && data && (
          <div className="pt-6">
            <ScenariosFilters />
          </div>
        )}
      </div>
      {isLoading && <p>Loading scenarios...</p>}
      {!isLoading && data && (
        <div className="flex-1 z-10 pb-4">
          <ScenariosList data={scenarios} />
        </div>
      )}
      {!isLoading && error && (
        <div className="rounded-md bg-red-50 p-4 my-4">
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
      <div className="bg-white z-20 sticky bottom-0 left-0 w-full py-6">
        <Button size="xl" className="block w-full" onClick={handleClick}>
          <PlusIcon className="-ml-5 mr-3 h-5 w-5" aria-hidden="true" />
          Create a new scenario
        </Button>
        {!scenarios ||
          (scenarios.length === 0 && (
            <div className="p-7 space-y-8 text-center absolute z-20 bg-white">
              <p className="text-sm">
                Scenarios let you simulate changes in sourcing to evaluate how they would affect
                impacts and risks. Create a scenario to get started.
              </p>
              <div className="w-full">
                <Lottie
                  animationData={noScenariosAnimationData}
                  loop
                  style={{ height: 74, width: 74, margin: 'auto' }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ScenariosComponent;
