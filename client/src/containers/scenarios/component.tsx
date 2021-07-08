import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/solid';
import ScenariosList from 'containers/scenarios/list';
import { Anchor } from 'components/button';
import type { Scenarios } from './types';

type ScenariosProps = {
  scenarios: {
    isLoading: boolean;
    data: Scenarios;
  };
};

const ScenariosComponent: React.FC<ScenariosProps> = ({ scenarios }: ScenariosProps) => {
  const { data, isLoading } = scenarios;

  return (
    <div>
      <h1>Analyse impact</h1>
      <p className="text-sm mt-2 mb-2">Select the scenario you want to analyse</p>
      {isLoading && <p>Loading scenarios...</p>}
      {!isLoading && data && <ScenariosList data={data} />}
      <Link href="/analysis?scenarios=new" shallow>
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
