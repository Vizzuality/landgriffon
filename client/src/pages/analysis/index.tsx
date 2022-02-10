import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { Transition } from '@headlessui/react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import ApplicationLayout from 'layouts/application';
import Breadcrumb from 'components/breadcrumb';
import Scenarios from 'containers/scenarios';
import ScenarioNew from 'containers/scenarios/new';
import ScenarioEdit from 'containers/scenarios/edit';
import ScenariosForm from 'containers/scenarios/new/form';
import { analysis, setSubContentCollapsed } from 'store/features/analysis';
import CollapseButton from 'containers/collapse-button';

import type { Page } from 'components/breadcrumb/types';

const AnalysisVisualizationNoSSR = dynamic(() => import('containers/analysis-visualization'), {
  ssr: false,
});

const AnalysisPage: React.FC = () => {
  const { isSidebarCollapsed, isSubContentCollapsed } = useAppSelector(analysis);

  const analysisContent = () => {
    if (new_scenario) return <ScenarioNew />;
    if (edit_scenario) return <ScenarioEdit />;
    return <Scenarios />;
  };

  const dispatch = useAppDispatch();
  const { query } = useRouter();
  const { new_scenario, edit_scenario } = query;

  // Breadcrumbs
  let pages: Page[] = [{ name: 'Analysis', href: '/analysis' }]; // Default
  if (edit_scenario) {
    pages = [...pages, { name: 'Edit scenario', href: '/analysis?edit_scenario' }];
  }

  if (new_scenario) {
    pages = [...pages, { name: 'New scenario', href: '/analysis?new_scenario' }];
  }

  useEffect(() => {
    // Close and cancel interventions creation
    // when user goes to scenarios list
    if (!new_scenario && !edit_scenario) dispatch(setSubContentCollapsed(true));
  }, [new_scenario, edit_scenario, dispatch]);

  return (
    <ApplicationLayout>
      <Head>
        <title>Analysis - Landgriffon</title>
      </Head>
      <main className="flex-1">
        <div className="h-screen flex">
          {/* Analysis content */}
          <div className="relative h-full z-30">
            <section className="relative h-full top-0 hidden lg:block lg:flex-shrink-0 lg:order-first">
              <Transition
                className="h-full relative flex flex-col border-r border-gray-200 bg-white w-96 overflow-x-hidden px-6"
                show={!isSidebarCollapsed}
                enter="transition-opacity duration-75"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="pt-6 pb-10">
                  <Breadcrumb pages={pages} />
                </div>
                {analysisContent()}
              </Transition>

              {/* Analysis aside */}
              {!isSubContentCollapsed && !isSidebarCollapsed && (
                <aside className="absolute ml-96 top-0 h-full hidden lg:block lg:flex-shrink-0 bg-white z-20 min-w-min w-250">
                  <div className="h-full flex flex-col border-r border-gray-200 p-6 overflow-auto w-full">
                    {/* For now, I'm going to assume we will only have the intervention form here */}
                    <ScenariosForm />
                  </div>
                </aside>
              )}
              {isSubContentCollapsed && (
                <div className="absolute top-5 right-0 transform translate-x-1/2 z-30">
                  <CollapseButton />
                </div>
              )}
            </section>
          </div>
          <AnalysisVisualizationNoSSR />
        </div>
      </main>
    </ApplicationLayout>
  );
};

export default AnalysisPage;
