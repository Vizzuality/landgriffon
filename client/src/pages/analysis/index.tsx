import Head from 'next/head';

import AnalysisLayout from 'layouts/analysis';
import Scenarios from 'containers/scenarios';

const AnalysisPage: React.FC = () => (
  <AnalysisLayout>
    <Head>
      <title>Analysis - Landgriffon</title>
    </Head>

    <Scenarios />
  </AnalysisLayout>
);

export async function getServerSideProps({ query }) {
  return { props: { query } };
}

export default AnalysisPage;
