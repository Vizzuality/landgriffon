import Head from 'next/head';

import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis/scenarios';

import AnalysisLayout from 'layouts/analysis';
import Breadcrumb from 'components/breadcrumb';
import type { Page } from 'components/breadcrumb/types';

const AnalysisPage: React.FC = () => {
  const { mode } = useAppSelector(scenarios);

  // Breadcrumbs
  let pages: Page[] = [{ name: 'Analysis', mode: 'list', href: 'analysis' }]; // Default
  if (mode === 'edit') {
    pages = [...pages, { name: 'New scenario', mode: 'new', href: 'new' }];
  }

  return (
    <AnalysisLayout>
      <Head>
        <title>Analysis - Landgriffon</title>
      </Head>
      <div className="py-6">
        <Breadcrumb pages={pages} />
      </div>
    </AnalysisLayout>
  );
};

export default AnalysisPage;
