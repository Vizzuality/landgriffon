import AnalysisChart from 'containers/analysis-visualization/analysis-chart';
import useEffectOnce from 'hooks/once';
import AnalysisLayout from 'layouts/analysis';
import Head from 'next/head';
import type { NextPageWithLayout } from 'pages/_app';
import { setVisualizationMode } from 'store/features/analysis';
import { useAppDispatch } from 'store/hooks';

const ChartPage: NextPageWithLayout = () => {
  const dispatch = useAppDispatch();

  useEffectOnce(() => {
    dispatch(setVisualizationMode('chart'));
  });

  return (
    <>
      <Head>
        <title>Chart View - LandGriffon</title>
      </Head>
      <AnalysisChart />
    </>
  );
};

ChartPage.Layout = AnalysisLayout;

export async function getServerSideProps({ query }) {
  return { props: { query } };
}

export default ChartPage;
