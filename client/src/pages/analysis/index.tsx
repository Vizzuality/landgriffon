import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch } from 'store/hooks';
import Head from 'next/head';

import AnalysisLayout from 'layouts/analysis';
import Breadcrumb from 'components/breadcrumb';
import Scenarios from 'containers/scenarios';
import ScenarioNew from 'containers/scenarios/new';
import ScenarioEdit from 'containers/scenarios/edit';
import { setSubContentCollapsed } from 'store/features/analysis';

import type { Page } from 'components/breadcrumb/types';

const AnalysisPage: React.FC = () => {
  const analysisContent = () => {
    if (scenario === 'new') return <ScenarioNew />;
    if (scenario === 'edit') return <ScenarioEdit />;
    return <Scenarios />;
  };

  const dispatch = useAppDispatch();
  const {
    query: { scenario },
  } = useRouter();

  // Breadcrumbs
  let pages: Page[] = [{ name: 'Analysis', href: '/analysis' }]; // Default
  if (scenario === 'edit') {
    pages = [...pages, { name: 'Edit scenario', href: '/analysis?scenario=edit' }];
  }
  if (scenario === 'new') {
    pages = [...pages, { name: 'New scenario', href: '/analysis?scenario=new' }];
  }

  useEffect(() => {
    // Close and cancel interventions creation
    // when user goes to scenarios list
    if (!scenario) dispatch(setSubContentCollapsed(true));
  }, [scenario, dispatch]);

  return (
    <AnalysisLayout>
      <Head>
        <title>Analysis - Landgriffon</title>
      </Head>

      <div className="py-6">
        <Breadcrumb pages={pages} />
      </div>

      {analysisContent()}
    </AnalysisLayout>
  );
};

export default AnalysisPage;
