import Link from 'next/link';
import { useRouter } from 'next/router';
import { PlusIcon, XCircleIcon } from '@heroicons/react/solid';
import ScenariosFilters from 'containers/scenarios/filters';
import ScenariosList from 'containers/scenarios/list';
import Breadcrumb from 'components/breadcrumb';
import { AnchorLink } from 'components/button';
import { useScenarios } from 'hooks/scenarios';
import type { Page } from 'components/breadcrumb/types';

const ScenariosComponent: React.FC = () => {
  const { query } = useRouter();
  const { data, isLoading, error } = useScenarios({ sort: query.sortBy as string });
  const { edit_scenario } = query;

  // Breadcrumbs
  let pages: Page[] = [{ name: 'Analysis', href: '/analysis' }]; // Default

  if (edit_scenario) {
    pages = [...pages, { name: 'Edit scenario', href: '/analysis?edit_scenario' }];
  }

  return (
    <div className="bg-white overscroll-contain">
      <div className="sticky top-0 bottom-1 z-20 bg-white">
        <div className="pb-10 bg-white pt-6">
          <Breadcrumb pages={pages} />
        </div>
        <h1>Analyse impact</h1>
        <p className="text-sm mt-2 mb-2">Select the scenario you want to analyse</p>
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
      <div className="bg-white z-20 sticky bottom-0 left-0 w-full">
        <div className="py-2">
          <Link href="/analysis?new_scenario=true" shallow passHref>
            <AnchorLink size="xl" className="block w-full">
              <PlusIcon className="-ml-5 mr-3 h-5 w-5" aria-hidden="true" />
              Create a new scenario
            </AnchorLink>
          </Link>
        </div>
        {!data ||
          (data.length === 0 && (
            <div className="py-8 px-7 text-center absolute z-20 bg-white">
              <p className="text-sm">
                Scenarios let you simulate changes in sourcing to evaluate how they would affect
                impacts and risks. Create a scenario to get started.
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ScenariosComponent;
