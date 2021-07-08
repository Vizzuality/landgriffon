import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { Transition } from '@headlessui/react';

import ApplicationLayout from 'layouts/application';
import Breadcrumb from 'components/breadcrumb';
import AnalysisVisualization from 'containers/analysis-visualization';
import Scenarios from 'containers/scenarios';
import ScenarioNew from 'containers/scenarios/new';
import ScenarioEdit from 'containers/scenarios/edit';
import InterventionForm from 'containers/interventions/form';
import { analysis, setSubContentCollapsed } from 'store/features/analysis';
import CollapseButton from 'containers/collapse-button';
// import {
//   isSidebarCollapsed,
//   isSubContentCollapsed,
//   setSubContentCollapsed,
// } from 'store/features/analysis';

import type { Page } from 'components/breadcrumb/types';

const AnalysisPage: React.FC = () => {
  const { isSidebarCollapsed, isSubContentCollapsed } = useAppSelector(analysis);
  // const isCollapsed = useAppSelector(isSidebarCollapsed);
  // const isSubContentCollapsedState = useAppSelector(isSubContentCollapsed);
  const dispatch = useAppDispatch();
  const { query } = useRouter();
  const { scenarios } = query;

  const analysisContent = () => ({
    default: <Scenarios />,
    new: <ScenarioNew />,
    edit: <ScenarioEdit />,
  });

  // Breadcrumbs
  let pages: Page[] = [{ name: 'Analysis', href: '/analysis' }]; // Default
  if (scenarios && scenarios === 'new') {
    pages = [...pages, { name: 'New scenario', href: '/analysis?scenarios=new' }];
  }
  if (scenarios && scenarios === 'edit') {
    pages = [...pages, { name: 'Edit scenario', href: '/analysis?scenarios=edit' }];
  }

  useEffect(() => {
    // Close and cancel interventions creation
    // when user goes to scenarios list
    if (!scenarios) dispatch(setSubContentCollapsed(true));
  }, [scenarios]);

  return (
    <ApplicationLayout>
      <main className="flex-1 flex">
        <div className="flex-1 flex">
          <AnalysisVisualization />

          {/* Analysis content */}
          <section className="relative hidden lg:block lg:flex-shrink-0 lg:order-first">
            <Transition
              className="h-full relative flex flex-col border-r border-gray-200 bg-white p-6 w-96 overflow-x-hidden"
              show={!isSidebarCollapsed}
              enter="transition-opacity duration-75"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="pb-10">
                <Breadcrumb pages={pages} />
              </div>
              {analysisContent()[(scenarios || 'default') as string]}
            </Transition>
            <div className="absolute top-4 right-0 transform translate-x-1/2 z-10">
              <CollapseButton />
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
