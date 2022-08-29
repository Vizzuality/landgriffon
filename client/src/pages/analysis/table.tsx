import AnalysisTable from 'containers/analysis-visualization/analysis-table';
import useEffectOnce from 'hooks/once';
import AnalysisLayout from 'layouts/analysis';
import type { NextPageWithLayout } from 'pages/_app';
import { setVisualizationMode } from 'store/features/analysis';
import { useAppDispatch } from 'store/hooks';
import TitleTemplate from 'utils/titleTemplate';

const TablePage: NextPageWithLayout = () => {
  const dispatch = useAppDispatch();

  useEffectOnce(() => {
    dispatch(setVisualizationMode('table'));
  });
  return (
    <>
      <TitleTemplate title="Table View" />
      <AnalysisTable />
    </>
  );
};

TablePage.Layout = AnalysisLayout;

// export async function getServerSideProps({ query }) {
//   return { props: { query } };
// }

export default TablePage;
