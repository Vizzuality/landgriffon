import Head from 'next/head';

import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis/scenarios';

import AnalysisLayout from 'layouts/analysis';
import Scenarios from 'containers/scenarios';
import ScenarioEdit from 'containers/scenarios/edit';

const AnalysisPage: React.FC = () => {
  const { mode } = useAppSelector(scenarios);
  const analysisContent = () => {
    if (mode === 'edit') return <ScenarioEdit />;
    return <Scenarios />;
  };

  return (
    <AnalysisLayout>
      <Head>
        <title>Analysis - Landgriffon</title>
      </Head>

      {analysisContent()}
    </AnalysisLayout>
  );
};

export async function getServerSideProps({ query }) {
  return { props: { query } };
}

export default AnalysisPage;
