import AnalysisTable from 'containers/analysis-visualization/analysis-table';
import useEffectOnce from 'hooks/once';
import AnalysisLayout from 'layouts/analysis';
import { NextSeo } from 'next-seo';
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
      <NextSeo title="Table View" />
      <AnalysisTable />
    </>
  );
};

TablePage.Layout = AnalysisLayout;

// export async function getServerSideProps({ query }) {
//   return { props: { query } };
// }

export default TablePage;
