import Link from 'next/link';
import { useRouter } from 'next/router';
import { PlusIcon, XCircleIcon } from '@heroicons/react/solid';
import ScenariosFilters from 'containers/scenarios/filters';
import ScenariosList from 'containers/scenarios/list';
import { AnchorLink } from 'components/button';
import Lottie from 'lottie-react';
import { useScenarios } from 'hooks/scenarios';

import noScenariosAnimationData from 'containers/scenarios/animations/noScenariosAnimationData.json';

const ScenariosComponent: React.FC = () => {
  const { query } = useRouter();
  const { data, isLoading, error } = useScenarios({ sort: query.sortBy as string });

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
          <ScenariosList data={data} />
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
        <Link href={{ pathname: '/analysis', query: { scenario: 'new' } }} shallow passHref>
          <AnchorLink size="xl" className="block w-full">
            <PlusIcon className="-ml-5 mr-3 h-5 w-5" aria-hidden="true" />
            Create a new scenario
          </AnchorLink>
        </Link>
        {!data ||
          (data.length === 0 && (
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
