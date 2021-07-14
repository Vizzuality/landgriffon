import Link from 'next/link';
import { PlusIcon, XCircleIcon } from '@heroicons/react/solid';
import ScenariosFilters from 'containers/scenarios/filters';
import ScenariosList from 'containers/scenarios/list';
import { Anchor } from 'components/button';
import type { UseQueryResult } from 'react-query';
import type { Scenarios } from './types';

type ScenariosProps = {
  scenarios: UseQueryResult;
};

const ScenariosComponent: React.FC<ScenariosProps> = ({ scenarios }: ScenariosProps) => {
  const { data, isLoading, error } = scenarios;

  return (
    <div>
      <h1>Analyse impact</h1>
      <p className="text-sm mt-2 mb-2">Select the scenario you want to analyse</p>
      {isLoading && <p>Loading scenarios...</p>}
      {!isLoading && data && (
        <>
          <ScenariosFilters />
          <ScenariosList data={data as Scenarios} />
        </>
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
      <Link href="/analysis?new_scenario=true" shallow>
        <Anchor size="xl">
          <PlusIcon className="-ml-5 mr-3 h-5 w-5" aria-hidden="true" />
          Create scenario
        </Anchor>
      </Link>
      <div className="mt-4 p-6 text-center">
        <p className="text-sm">
          Scenarios let you simulate changes in sourcing to evaluate how they would affect impacts
          and risks. Create a scenario to get started.
        </p>
      </div>
    </div>
  );
};

export default ScenariosComponent;
