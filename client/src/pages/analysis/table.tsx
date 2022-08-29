import AnalysisTable from 'containers/analysis-visualization/analysis-table';
import useEffectOnce from 'hooks/once';
import AnalysisLayout from 'layouts/analysis';
import Head from 'next/head';
import type { NextPageWithLayout } from 'pages/_app';
import { setVisualizationMode } from 'store/features/analysis';
import { useAppDispatch } from 'store/hooks';

const TablePage: NextPageWithLayout = () => {
  const dispatch = useAppDispatch();

  useEffectOnce(() => {
    dispatch(setVisualizationMode('table'));
  });
  return (
    <>
      <Head>
        <title>Table View - LandGriffon</title>
      </Head>
      <AnalysisTable />
    </>
  );
};

TablePage.Layout = AnalysisLayout;

// export async function getServerSideProps({ query }) {
//   return { props: { query } };
// }

export default TablePage;
