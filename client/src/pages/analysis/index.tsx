import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import ApplicationLayout from 'layouts/application';
import Breadcrumb from 'components/breadcrumb';
import AnalysisVisualization from 'containers/analysis-visualization';
import Scenarios from 'containers/scenarios';
import ScenarioNew from 'containers/scenarios/new';
import ScenarioEdit from 'containers/scenarios/edit';
import InterventionForm from 'containers/interventions/form';
import { isSubContentCollapsed, setSubContentCollapsed } from 'store/features/analysis';

import type { Page } from 'components/breadcrumb/types';

const AnalysisPage: React.FC = () => {
  const isSubContentCollapsedState = useAppSelector(isSubContentCollapsed);
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
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex xl:overflow-hidden">
          <AnalysisVisualization />

          {/* Analysis content */}
          <section className="hidden lg:block lg:flex-shrink-0 lg:order-first">
            <div className="h-full relative flex flex-col w-96 border-r border-gray-200 bg-white p-6">
              <div className="pb-10">
                <Breadcrumb pages={pages} />
              </div>
              {analysisContent()[(scenarios || 'default') as string]}
            </div>
          </section>

          {/* Analysis aside */}
          {!isSubContentCollapsedState && (
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
