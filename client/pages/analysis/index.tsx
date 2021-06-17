import Link from 'next/link';
import { useRouter } from 'next/router';
import { PlusIcon } from '@heroicons/react/solid';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import ApplicationLayout from 'layouts/application';
import Breadcrumb from 'components/breadcrumb';
import Map from 'components/map';
import Scenarios from 'containers/scenarios';
import ScenarioForm from 'containers/scenarios/form';
import Interventions from 'containers/interventions';
import InterventionForm from 'containers/interventions/form';
import { setSubContentCollapsed } from 'store/features/analysis/slice';

import type { Page } from 'components/breadcrumb/types';
import { useEffect } from 'react';

const MAPBOX_API_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN;

let pages: Page[] = [];

const AnalysisPage: React.FC = () => {
  const isSubContentCollapsed = useAppSelector((state) => state.analysis.isSubContentCollapsed);
  const dispatch = useAppDispatch();
  const { query } = useRouter();
  const { scenarios } = query;

  let Content;

  /**
   * List scenarios
   */
  pages = [];
  Content = () => (
    <>
      <h1 className="text-lg font-medium">Scenarios</h1>
      <p>Select an scenario to analyse</p>
      <Scenarios />
      <Link href="/analysis?scenarios=new" shallow>
        <a className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <PlusIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Create scenario
        </a>
      </Link>
    </>
  );

  /**
   * Create scenario
   */
  if (scenarios && scenarios === 'new') {
    pages = [{ name: 'New scenario', href: '/analysis?scenarios=new', current: true }];
    Content = () => (
      <>
        <div>
          <ScenarioForm />
        </div>
        <div className="mt-10">
          <Interventions />
        </div>
      </>
    );
  }

  /**
   * Edit scenario
   */
  if (scenarios && scenarios === 'edit') {
    pages = [{ name: 'Edit scenario', href: '/analysis?scenarios=edit', current: true }];
    Content = () => (
      <>
        <h1>Edit scenario</h1>
        <Link href="/analysis" shallow>
          <a>Cancel</a>
        </Link>
      </>
    );
  }

  useEffect(() => {
    // Close and cancel interventions creation
    // when user goes to scenarios list
    if (!scenarios) dispatch(setSubContentCollapsed(true));
  }, [scenarios]);

  return (
    <ApplicationLayout>
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex xl:overflow-hidden">
          {/* Analysis map */}
          <section className="min-w-0 flex-1 h-full flex flex-col overflow-hidden lg:order-last">
            <Map
              mapboxApiAccessToken={MAPBOX_API_TOKEN}
              mapStyle="mapbox://styles/landgriffon/ckmdaj5gy08yx17me92nudkjd"
            />
          </section>

          {/* Analysis content */}
          <section className="hidden lg:block lg:flex-shrink-0 lg:order-first">
            <div className="h-full relative flex flex-col w-96 border-r border-gray-200 bg-white p-6">
              <div className="pb-10">
                <Breadcrumb pages={pages} />
              </div>
              <Content />
            </div>
          </section>

          {/* Analysis aside */}
          {!isSubContentCollapsed && (
            <aside className="absolute ml-96 h-full hidden lg:block lg:flex-shrink-0 w-1/2">
              <div className="h-full relative flex flex-col w-auto border-r border-gray-200 bg-white p-6 overflow-auto">
                {/* For now, I'm going to assume we will only have the intervention form here */}
                <InterventionForm />
              </div>
            </aside>
          )}
        </div>
      </main>
    </ApplicationLayout>
  );
};

export default AnalysisPage;
