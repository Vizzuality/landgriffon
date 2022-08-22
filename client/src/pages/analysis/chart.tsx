import AnalysisTable from 'containers/analysis-visualization/analysis-table';
import useEffectOnce from 'hooks/once';
import AnalysisLayout from 'layouts/analysis';
import type { NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { setVisualizationMode } from 'store/features/analysis';
import { useAppDispatch } from 'store/hooks';

const ChartPage: NextPage = () => {
  const dispatch = useAppDispatch();

  useEffectOnce(() => {
    dispatch(setVisualizationMode('chart'));
  });

  return (
    <AnalysisLayout>
      <NextSeo title="Chart View" />
      <AnalysisTable />
    </AnalysisLayout>
  );
};

export async function getServerSideProps({ query }) {
  return { props: { query } };
}

export default ChartPage;
